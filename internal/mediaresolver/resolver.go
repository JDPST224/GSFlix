package mediaresolver

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"

	"movie/internal/config"
)

type MediaType string

const (
	Movie MediaType = "movie"
	TV    MediaType = "tv"
)

type MediaRequest struct {
	Type    MediaType
	ID      string
	Season  string
	Episode string
}

type hlsCandidate struct {
	url         string
	contentType string
	status      int64
}

type Resolver struct {
	cfg    config.Config
	sem    chan struct{}
	cache  *sourceCache
	mu     sync.Mutex
	closed bool
}

func New(cfg config.Config) (*Resolver, error) {
	if cfg.MaxBrowserSessions < 1 {
		return nil, errors.New("MAX_BROWSER_SESSIONS must be greater than zero")
	}
	u, err := url.Parse(cfg.TargetOrigin)
	if err != nil || u.Scheme != "https" || u.Host == "" {
		return nil, errors.New("TARGET_ORIGIN must be an HTTPS origin")
	}
	return &Resolver{cfg: cfg, sem: make(chan struct{}, cfg.MaxBrowserSessions), cache: newSourceCache(cfg.SourceCacheTTL)}, nil
}

func (r *Resolver) Close() {
	r.mu.Lock()
	r.closed = true
	r.mu.Unlock()
}

func (r *Resolver) Resolve(parent context.Context, req MediaRequest) (string, error) {
	if err := validateRequest(req); err != nil {
		return "", err
	}
	key := cacheKey(req)
	if u, ok := r.cache.get(key); ok {
		log.Printf("[MediaResolver] cache hit key=%s", key)
		return u, nil
	}

	select {
	case r.sem <- struct{}{}:
		defer func() { <-r.sem }()
	case <-parent.Done():
		return "", parent.Err()
	}

	r.mu.Lock()
	closed := r.closed
	r.mu.Unlock()
	if closed {
		return "", errors.New("resolver is closed")
	}

	target, err := r.targetURL(req)
	if err != nil {
		return "", err
	}
	log.Printf("[MediaResolver] Resolving %s", target)

	ctx, cancel := context.WithTimeout(parent, r.cfg.SourceResolutionTimeout)
	defer cancel()

	source, err := r.resolveInBrowser(ctx, target)
	if err != nil {
		return "", err
	}
	r.cache.put(key, source)
	return source, nil
}

func (r *Resolver) targetURL(req MediaRequest) (string, error) {
	base, err := url.Parse(r.cfg.TargetOrigin)
	if err != nil {
		return "", err
	}
	var path string
	switch req.Type {
	case Movie:
		path = "/movie/" + req.ID
	case TV:
		path = "/tv/" + req.ID + "/" + req.Season + "/" + req.Episode
	default:
		return "", errors.New("unsupported media type")
	}
	target, err := base.Parse(path)
	if err != nil {
		return "", err
	}
	if target.Scheme != base.Scheme || !strings.EqualFold(target.Host, base.Host) {
		return "", errors.New("target escaped configured origin")
	}
	return target.String(), nil
}

func (r *Resolver) resolveInBrowser(parent context.Context, target string) (string, error) {
	log.Printf("[MediaResolver] Opening browser")

	browserParent := parent
	if r.cfg.BrowserTimeout > 0 {
		var cancel context.CancelFunc
		browserParent, cancel = context.WithTimeout(parent, r.cfg.BrowserTimeout)
		defer cancel()
	}

	opts := append([]chromedp.ExecAllocatorOption{}, chromedp.DefaultExecAllocatorOptions[:]...)
	opts = append(opts,
		chromedp.Flag("headless", r.cfg.BrowserHeadless),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-first-run", true),
		chromedp.Flag("no-default-browser-check", true),
	)
	if r.cfg.BrowserExecutable != "" {
		opts = append(opts, chromedp.ExecPath(r.cfg.BrowserExecutable))
	}

	alloc, cancelAlloc := chromedp.NewExecAllocator(browserParent, opts...)
	defer cancelAlloc()
	ctx, cancelBrowser := chromedp.NewContext(alloc)
	defer cancelBrowser()

	var mu sync.Mutex
	candidates := make([]hlsCandidate, 0, 8)

	chromedp.ListenTarget(ctx, func(ev any) {
		e, ok := ev.(*network.EventResponseReceived)
		if !ok || e.Response == nil || !isPotentialHLS(e.Response.URL, e.Response.MimeType) {
			return
		}
		c := hlsCandidate{url: e.Response.URL, contentType: e.Response.MimeType, status: e.Response.Status}
		mu.Lock()
		candidates = append(candidates, c)
		mu.Unlock()
		log.Printf("[MediaResolver] HLS source detected status=%d mime=%s", c.status, c.contentType)
	})

	log.Printf("[MediaResolver] Navigating to media page")
	if err := chromedp.Run(ctx, network.Enable(), chromedp.Navigate(target)); err != nil {
		return "", fmt.Errorf("navigation failed: %w", err)
	}

	log.Printf("[MediaResolver] Waiting for player")
	wait := time.NewTimer(2 * time.Second)
	select {
	case <-wait.C:
	case <-parent.Done():
		wait.Stop()
		return "", parent.Err()
	}

	for {
		mu.Lock()
		source := chooseCandidate(candidates)
		mu.Unlock()
		if source != "" {
			log.Printf("[MediaResolver] Returning HLS source")
			return source, nil
		}
		select {
		case <-parent.Done():
			return "", parent.Err()
		case <-time.After(200 * time.Millisecond):
		}
	}
}

func isPotentialHLS(raw, mime string) bool {
	u, err := url.Parse(raw)
	if err != nil || u.Scheme != "https" || u.Host == "" {
		return false
	}
	path := strings.ToLower(u.Path)
	m := strings.ToLower(strings.TrimSpace(strings.Split(mime, ";")[0]))
	return strings.HasSuffix(path, ".m3u8") || m == "application/vnd.apple.mpegurl" || m == "application/x-mpegurl" || m == "audio/mpegurl"
}

func chooseCandidate(cs []hlsCandidate) string {
	for i := len(cs) - 1; i >= 0; i-- {
		c := cs[i]
		if c.status < 200 || c.status >= 400 {
			continue
		}
		if strings.Contains(strings.ToLower(c.contentType), "mpegurl") || strings.HasSuffix(strings.ToLower(c.url), ".m3u8") {
			return c.url
		}
	}
	return ""
}

func validateRequest(r MediaRequest) error {
	switch r.Type {
	case Movie:
		if !validNumeric(r.ID) {
			return errors.New("invalid movie ID")
		}
	case TV:
		if !validNumeric(r.ID) || !validNumeric(r.Season) || !validNumeric(r.Episode) {
			return errors.New("invalid TV episode parameters")
		}
	default:
		return errors.New("unsupported media type")
	}
	return nil
}

func validNumeric(s string) bool {
	if s == "" || len(s) > 20 {
		return false
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}
func cacheKey(r MediaRequest) string {
	if r.Type == Movie {
		return "movie:" + r.ID
	}
	return "tv:" + r.ID + ":" + r.Season + ":" + r.Episode
}
