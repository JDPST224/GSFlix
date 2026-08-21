package mediaresolver

import (
	"compress/gzip"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

type MediaType string

const (
	Movie MediaType = "movie"
	TV    MediaType = "tv"
)

type MediaRequest struct {
	Type                MediaType
	ID, Season, Episode string
	Provider            string
}

type hlsCandidate struct {
	url, contentType string
	status           int64
	headers          http.Header
}

type Config struct {
	TargetOrigin, VidKingOrigin, VidLoveOrigin string
	BrowserHeadless                         bool
	BrowserTimeout, SourceResolutionTimeout time.Duration
	MaxBrowserSessions                      int
	BrowserExecutable                       string
	// SessionTTL is the sliding lifetime of a proxy session. Every proxied
	// request extends it, so playback is not cut off mid-stream.
	// Defaults to 4 hours when <= 0.
	SessionTTL time.Duration
}

// playbackHeaders are the browser headers captured during resolution and
// replayed against the upstream so the CDN sees the same playback context.
var playbackHeaders = []string{"User-Agent", "Referer", "Origin", "Cookie", "Accept", "Accept-Language"}

// maxManifestBytes caps upstream manifest bodies. Anything larger is rejected
// rather than silently truncated into a corrupt playlist.
const maxManifestBytes = 8 << 20

const defaultSessionTTL = 4 * time.Hour

// copyBufPool reuses 128 KB scratch buffers for proxying segment responses,
// providing high throughput and minimizing context switches for 4K and 1080p streams.
var copyBufPool = &sync.Pool{
	New: func() any {
		b := make([]byte, 128*1024)
		return &b
	},
}

type proxySession struct {
	source    string
	headers   http.Header
	allowed   map[string]bool
	expiresAt time.Time
}

type Resolver struct {
	cfg      Config
	sem      chan struct{}
	mu       sync.Mutex
	closed   bool
	done     chan struct{} // closed by Close() to wake the sweeper goroutine immediately
	sessions map[string]*proxySession
	// transport is shared across proxy requests for connection reuse.
	transport *http.Transport
	// blockCache memoizes per-hostname SSRF checks (hostname -> blocked).
	blockCache sync.Map
}

func New(cfg Config) (*Resolver, error) {
	if cfg.MaxBrowserSessions < 1 {
		return nil, errors.New("MAX_BROWSER_SESSIONS must be greater than zero")
	}
	if cfg.TargetOrigin == "" {
		cfg.TargetOrigin = "https://vixsrc.to"
	}
	if cfg.VidKingOrigin == "" {
		cfg.VidKingOrigin = "https://www.vidking.net"
	}
	if cfg.VidLoveOrigin == "" {
		cfg.VidLoveOrigin = "https://player.vidlove.cc"
	}
	cfg.TargetOrigin = strings.TrimRight(cfg.TargetOrigin, "/")
	cfg.VidKingOrigin = strings.TrimRight(cfg.VidKingOrigin, "/")
	cfg.VidLoveOrigin = strings.TrimRight(cfg.VidLoveOrigin, "/")
	for k, v := range map[string]string{"VIXSRC_ORIGIN": cfg.TargetOrigin, "VIDKING_ORIGIN": cfg.VidKingOrigin, "VIDLOVE_ORIGIN": cfg.VidLoveOrigin} {
		u, e := url.Parse(v)
		if e != nil || u.Scheme != "https" || u.Host == "" {
			return nil, fmt.Errorf("%s must be an HTTPS origin", k)
		}
		if (u.Path != "" && u.Path != "/") || u.RawQuery != "" || u.Fragment != "" {
			return nil, fmt.Errorf("%s must be a bare HTTPS origin (no path, query, or fragment)", k)
		}
	}
	r := &Resolver{
		cfg:      cfg,
		sem:      make(chan struct{}, cfg.MaxBrowserSessions),
		done:     make(chan struct{}),
		sessions: make(map[string]*proxySession),
		transport: &http.Transport{
			Proxy: http.ProxyFromEnvironment,
			DialContext: (&net.Dialer{
				Timeout:   5 * time.Second,
				KeepAlive: 60 * time.Second,
			}).DialContext,
			MaxIdleConns:          512,
			MaxIdleConnsPerHost:   64,
			MaxConnsPerHost:       128,
			IdleConnTimeout:       120 * time.Second,
			TLSHandshakeTimeout:   10 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
			ResponseHeaderTimeout: 30 * time.Second,
			ForceAttemptHTTP2:     true,
			ReadBufferSize:        128 * 1024,
			WriteBufferSize:       128 * 1024,
		},
	}
	// Periodically sweep expired proxy sessions so memory doesn't grow
	// indefinitely. The done channel lets Close() wake the goroutine instantly
	// instead of waiting up to 5 minutes for the next tick.
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-r.done:
				return
			case <-ticker.C:
				r.mu.Lock()
				now := time.Now()
				for tok, s := range r.sessions {
					if now.After(s.expiresAt) {
						delete(r.sessions, tok)
					}
				}
				r.mu.Unlock()
			}
		}
	}()
	return r, nil
}

func (r *Resolver) Close() {
	r.mu.Lock()
	if !r.closed {
		r.closed = true
		r.sessions = make(map[string]*proxySession)
		close(r.done) // wake the sweeper goroutine immediately
	}
	r.mu.Unlock()
	r.transport.CloseIdleConnections()
}

func (r *Resolver) isClosed() bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.closed
}

func (r *Resolver) sessionTTL() time.Duration {
	if r.cfg.SessionTTL > 0 {
		return r.cfg.SessionTTL
	}
	return defaultSessionTTL
}

func (r *Resolver) Resolve(parent context.Context, req MediaRequest) (string, error) {
	if err := validateRequest(req); err != nil {
		return "", err
	}
	// Fail fast before queueing on the browser semaphore so callers of a
	// closed resolver do not block until their context expires.
	if r.isClosed() {
		return "", errors.New("resolver is closed")
	}
	// A fresh browser run (and proxy session) is created for every Resolve
	// call; cached browser contexts cannot be reused safely across calls.
	// The semaphore slot is held across all retry attempts so the total number
	// of concurrent browser processes never exceeds MaxBrowserSessions.
	select {
	case r.sem <- struct{}{}:
		defer func() { <-r.sem }()
	case <-parent.Done():
		return "", parent.Err()
	}
	target, err := r.targetURL(req)
	if err != nil {
		return "", err
	}
	// BrowserTimeout is the single deadline authority. SourceResolutionTimeout
	// is retained in the config for backward compatibility but is no longer
	// applied here — wrapping with it would clamp BrowserTimeout and make that
	// config field useless.
	const maxAttempts = 2
	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if parent.Err() != nil {
			return "", parent.Err()
		}
		log.Printf("[MediaResolver] Resolving %s (attempt %d/%d)", redactQuery(target), attempt, maxAttempts)
		source, headers, allowed, err := r.resolveInBrowser(parent, target)
		if err == nil {
			token, err := r.newSession(source, headers, allowed)
			if err != nil {
				return "", err
			}
			return "/api/media/proxy/" + token + ".m3u8", nil
		}
		lastErr = err
		log.Printf("[MediaResolver] Attempt %d/%d failed: %v", attempt, maxAttempts, err)
	}
	return "", lastErr
}

func (r *Resolver) targetURL(req MediaRequest) (string, error) {
	origin := r.cfg.TargetOrigin
	if strings.EqualFold(strings.TrimSpace(req.Provider), "vidking") {
		origin = r.cfg.VidKingOrigin
	} else if strings.EqualFold(strings.TrimSpace(req.Provider), "vidlove") {
		origin = r.cfg.VidLoveOrigin
	}
	base, err := url.Parse(origin)
	if err != nil {
		return "", err
	}
	var p string
	switch req.Type {
	case Movie:
		p = "/movie/" + req.ID
	case TV:
		p = "/tv/" + req.ID + "/" + req.Season + "/" + req.Episode
	default:
		return "", errors.New("unsupported media type")
	}
	if strings.EqualFold(strings.TrimSpace(req.Provider), "vidking") || strings.EqualFold(strings.TrimSpace(req.Provider), "vidlove") {
		if req.Type == Movie {
			p = "/embed/movie/" + req.ID
		} else {
			p = "/embed/tv/" + req.ID + "/" + req.Season + "/" + req.Episode
		}
	}
	u, err := base.Parse(p)
	if err != nil {
		return "", err
	}
	if u.Scheme != base.Scheme || !strings.EqualFold(u.Host, base.Host) {
		return "", errors.New("target escaped configured origin")
	}
	return u.String(), nil
}

func (r *Resolver) resolveInBrowser(parent context.Context, target string) (string, http.Header, map[string]bool, error) {
	log.Printf("[MediaResolver] Opening browser")
	browserParent := parent
	if r.cfg.BrowserTimeout > 0 {
		var cancel context.CancelFunc
		browserParent, cancel = context.WithTimeout(parent, r.cfg.BrowserTimeout)
		defer cancel()
	}

	// Build a lean set of Chromium flags optimised for headless media scraping:
	// disable everything that isn't needed for network interception while maintaining stealth.
	opts := append([]chromedp.ExecAllocatorOption{}, chromedp.DefaultExecAllocatorOptions[:]...)
	opts = append(opts,
		chromedp.Flag("headless", r.cfg.BrowserHeadless),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-first-run", true),
		chromedp.Flag("no-default-browser-check", true),
		chromedp.Flag("disable-quic", true),
		chromedp.Flag("user-agent", defaultUserAgent),
		chromedp.Flag("disable-blink-features", "AutomationControlled"),
		chromedp.Flag("window-size", "1920,1080"),
		chromedp.Flag("lang", "en-US,en"),
		// Reduce startup overhead and memory footprint.
		chromedp.Flag("disable-extensions", true),
		chromedp.Flag("disable-background-networking", true),
		chromedp.Flag("disable-sync", true),
		chromedp.Flag("disable-translate", true),
		chromedp.Flag("disable-default-apps", true),
		chromedp.Flag("mute-audio", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("disable-features", "TranslateUI,BlinkGenPropertyTrees"),
		chromedp.Flag("disable-popup-blocking", true),
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
	requestHeaders := make(map[string]http.Header)
	hostHeaders := make(map[string]http.Header)

	// hlsFound is signalled (non-blocking) the moment the first HLS candidate
	// is captured, allowing the wait loop below to exit immediately instead of
	// polling every 200 ms.
	hlsFound := make(chan struct{}, 1)

	chromedp.ListenTarget(ctx, func(ev any) {
		e, ok := ev.(*network.EventResponseReceived)
		if !ok || e.Response == nil || !isPotentialHLS(e.Response.URL, e.Response.MimeType) {
			return
		}
		mu.Lock()
		h := cloneHeader(requestHeaders[e.Response.URL])
		delete(requestHeaders, e.Response.URL) // consumed; keep the map bounded
		c := hlsCandidate{url: e.Response.URL, contentType: e.Response.MimeType, status: e.Response.Status, headers: h}
		candidates = append(candidates, c)
		mu.Unlock()
		log.Printf("[MediaResolver] HLS source detected url=%s status=%d mime=%s", redactQuery(c.url), c.status, c.contentType)
		// Signal immediately — non-blocking so multiple events don't deadlock.
		select {
		case hlsFound <- struct{}{}:
		default:
		}
	})

	chromedp.ListenTarget(ctx, func(ev any) {
		e, ok := ev.(*network.EventRequestWillBeSent)
		if !ok {
			return
		}
		h := make(http.Header)
		for k, v := range e.Request.Headers {
			if value, ok := v.(string); ok {
				switch strings.ToLower(k) {
				case "user-agent", "referer", "origin", "cookie", "accept", "accept-language":
					h.Set(k, value)
				}
			}
		}
		parsed, err := url.Parse(e.Request.URL)
		if err != nil || parsed.Host == "" {
			return
		}
		host := strings.ToLower(parsed.Host)
		mu.Lock()
		// Cap the per-URL header map: long-lived pages can issue thousands of
		// requests and most are never matched to an HLS response.
		if len(requestHeaders) < 512 {
			requestHeaders[e.Request.URL] = cloneHeader(h)
		}
		// Retain the latest safe browser headers per host.
		if len(h) > 0 {
			hostHeaders[host] = cloneHeader(h)
		}
		mu.Unlock()
	})

	if strings.Contains(strings.ToLower(target), "vidking.net/embed/") || strings.Contains(strings.ToLower(target), "vidlove.cc/embed/") {
		log.Printf("[MediaResolver] Embed used only to discover its HLS manifest; frontend will receive the proxied HLS URL")
	}

	// Enable network interception synchronously before navigation so no events are missed.
	if err := chromedp.Run(ctx, network.Enable()); err != nil {
		return "", nil, nil, fmt.Errorf("network.Enable failed: %w", err)
	}

	navDone := make(chan error, 1)
	go func() {
		log.Printf("[MediaResolver] Navigating to media page (async)")
		var navErr error
		for attempt := 1; attempt <= 3; attempt++ {
			navErr = chromedp.Run(ctx, chromedp.Navigate(target))
			if navErr == nil {
				break
			}
			msg := navErr.Error()
			log.Printf("[MediaResolver] Navigation attempt %d/3 failed error=%v", attempt, navErr)
			if !strings.Contains(strings.ToLower(msg), "err_connection_reset") {
				break
			}
			select {
			case <-parent.Done():
				navDone <- parent.Err()
				return
			case <-time.After(time.Duration(attempt) * 500 * time.Millisecond):
			}
		}
		navDone <- navErr
	}()

	// Click-to-play automation: some embed pages render a poster/overlay that
	// must be clicked to start the video player.
	go func() {
		timer := time.NewTimer(3 * time.Second)
		defer timer.Stop()
		select {
		case <-timer.C:
		case <-hlsFound:
			return // already captured, no click needed
		case <-parent.Done():
			return
		}
		mu.Lock()
		alreadyFound := chooseCandidate(candidates).url != ""
		mu.Unlock()
		if alreadyFound {
			return
		}
		log.Printf("[MediaResolver] No HLS captured yet; attempting click-to-play")
		playSelectors := []string{
			`.vjs-big-play-button`,      // Video.js
			`.jw-icon-display`,          // JW Player
			`.plyr__control--overlaid`,  // Plyr
			`button[aria-label*="play" i]`,
			`.play-button`, `.btn-play`, `#play-btn`,
			`[class*="play-btn"]`, `[class*="playBtn"]`,
			`video`, // clicking the video element directly often starts playback
		}
		for _, sel := range playSelectors {
			mu.Lock()
			found := chooseCandidate(candidates).url != ""
			mu.Unlock()
			if found {
				return
			}
			_ = chromedp.Run(ctx, chromedp.Click(sel, chromedp.ByQuery))
		}
	}()

	log.Printf("[MediaResolver] Waiting for HLS source")

	log.Printf("[MediaResolver] Waiting for HLS source")

	// Main wait loop — immediately returns as soon as an HLS URL is captured or navigation finishes.
	for {
		mu.Lock()
		c := chooseCandidate(candidates)
		if c.url != "" {
			merged := cloneHeader(c.headers)
			if merged.Get("User-Agent") == "" {
				merged.Set("User-Agent", defaultUserAgent)
			}
			allowed := map[string]bool{}
			if u, e := url.Parse(c.url); e == nil {
				if fallback := hostHeaders[strings.ToLower(u.Host)]; fallback != nil {
					merged = mergeHeaders(merged, fallback)
				}
				allowed[strings.ToLower(u.Host)] = true
			}
			if ref := merged.Get("Referer"); ref != "" {
				if ru, e := url.Parse(ref); e == nil && ru.Host != "" {
					allowed[strings.ToLower(ru.Host)] = true
				}
			}
			mu.Unlock()
			return c.url, merged, allowed, nil
		}
		mu.Unlock()

		select {
		case <-parent.Done():
			return "", nil, nil, parent.Err()
		case navErr := <-navDone:
			mu.Lock()
			hasCandidate := chooseCandidate(candidates).url != ""
			mu.Unlock()
			if hasCandidate {
				if navErr != nil {
					log.Printf("[MediaResolver] Navigation error but HLS already captured; continuing error=%v", navErr)
				}
				navDone = nil // never select on navDone again
				continue
			}
			if navErr != nil {
				return "", nil, nil, fmt.Errorf("navigation failed: %w", navErr)
			}
			navDone = nil
		case <-hlsFound:
			// loop again to pick up the candidate immediately
		}
	}
}

func isPotentialHLS(raw, mime string) bool {
	u, e := url.Parse(raw)
	if e != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" {
		return false
	}
	m := strings.ToLower(strings.TrimSpace(strings.Split(mime, ";")[0]))
	// Standard HLS MIME types.
	if strings.Contains(m, "mpegurl") {
		return true
	}
	// URL-based detection: match .m3u8 anywhere in the full URL (path or query string).
	if strings.Contains(strings.ToLower(raw), "m3u8") {
		return true
	}
	// Some providers serve manifests as application/octet-stream or text/plain.
	if m == "application/octet-stream" || m == "text/plain" {
		p := strings.ToLower(u.Path)
		return strings.Contains(p, "playlist") || strings.Contains(p, "master") ||
			strings.Contains(p, "manifest") || strings.Contains(p, "index") ||
			strings.Contains(p, "stream") || strings.Contains(p, "video")
	}
	return false
}

func chooseCandidate(cs []hlsCandidate) hlsCandidate {
	bestScore := -1
	var best hlsCandidate
	for i := len(cs) - 1; i >= 0; i-- {
		c := cs[i]
		if c.status < 200 || c.status >= 400 {
			continue
		}
		lower := strings.ToLower(c.url)
		score := 0
		switch {
		case strings.Contains(lower, "/playlist/"):
			score = 100
		case strings.Contains(lower, "master.m3u8"):
			score = 95
		case strings.Contains(lower, "manifest.m3u8"):
			score = 90
		case strings.Contains(lower, "master") && strings.Contains(lower, ".m3u8"):
			score = 85
		case strings.Contains(lower, "index.m3u8") || strings.Contains(lower, "stream.m3u8"):
			score = 80
		case strings.HasSuffix(strings.Split(lower, "?")[0], ".m3u8"):
			score = 70
		case strings.Contains(lower, ".m3u8"):
			score = 60
		case strings.Contains(strings.ToLower(c.contentType), "mpegurl"):
			score = 50
		default:
			score = 20
		}
		if score > bestScore {
			bestScore = score
			best = c
		}
	}
	return best
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
	switch strings.ToLower(strings.TrimSpace(r.Provider)) {
	case "", "vixsrc", "vidking", "vidlove":
		return nil
	default:
		return errors.New("unsupported provider")
	}
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

func (r *Resolver) newSession(source string, headers http.Header, allowed map[string]bool) (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := base64.RawURLEncoding.EncodeToString(b)
	now := time.Now()
	r.mu.Lock()
	defer r.mu.Unlock()
	// A Resolve that was already in flight when Close ran must not re-insert sessions.
	if r.closed {
		return "", errors.New("resolver is closed")
	}
	for tok, session := range r.sessions {
		if now.After(session.expiresAt) {
			delete(r.sessions, tok)
		}
	}
	if headers == nil {
		headers = make(http.Header)
	}
	if headers.Get("User-Agent") == "" {
		headers.Set("User-Agent", defaultUserAgent)
	}
	r.sessions[token] = &proxySession{source: source, headers: cloneHeader(headers), allowed: allowed, expiresAt: now.Add(r.sessionTTL())}
	return token, nil
}

func cloneHeader(in http.Header) http.Header {
	out := make(http.Header)
	for k, v := range in {
		for _, x := range v {
			out.Add(k, x)
		}
	}
	return out
}

func mergeHeaders(primary, fallback http.Header) http.Header {
	out := cloneHeader(primary)
	for _, key := range playbackHeaders {
		if out.Get(key) == "" && fallback.Get(key) != "" {
			out.Set(key, fallback.Get(key))
		}
	}
	return out
}

func mergeResponseCookies(headers http.Header, cookies []*http.Cookie) {
	values := make(map[string]string)
	for _, part := range strings.Split(headers.Get("Cookie"), ";") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		pieces := strings.SplitN(part, "=", 2)
		if len(pieces) == 2 {
			values[strings.TrimSpace(pieces[0])] = strings.TrimSpace(pieces[1])
		}
	}
	for _, cookie := range cookies {
		if cookie != nil && cookie.Name != "" {
			values[cookie.Name] = cookie.Value
		}
	}
	parts := make([]string, 0, len(values))
	for name, value := range values {
		parts = append(parts, name+"="+value)
	}
	if len(parts) > 0 {
		headers.Set("Cookie", strings.Join(parts, "; "))
	}
}

// Proxy serves HLS manifests and media resources through the server. It rewrites
// manifest URIs so the browser never contacts the provider/CDN directly.
func (r *Resolver) Proxy(w http.ResponseWriter, req *http.Request, token string) error {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges")

	if req.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return nil
	}

	if req.Method != http.MethodGet && req.Method != http.MethodHead {
		return errors.New("method not allowed")
	}
	r.mu.Lock()
	s, ok := r.sessions[token]
	if ok && time.Now().After(s.expiresAt) {
		delete(r.sessions, token)
		ok = false
	}
	if !ok {
		r.mu.Unlock()
		return errors.New("proxy session expired")
	}
	// Sliding expiration: active playback keeps the session alive.
	s.expiresAt = time.Now().Add(r.sessionTTL())
	source := s.source
	sessionHeaders := cloneHeader(s.headers)
	allowed := cloneAllowed(s.allowed)
	r.mu.Unlock()

	raw := req.URL.Query().Get("url")
	if raw == "" {
		raw = source
	}
	u, err := url.Parse(raw)
	if err != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" {
		return errors.New("invalid upstream URL")
	}
	host := strings.ToLower(u.Host)
	if !allowed[host] {
		return errors.New("upstream host not allowed")
	}
	if r.blockedUpstreamHost(req.Context(), u.Hostname()) {
		return errors.New("upstream host blocked")
	}
	client := &http.Client{
		Transport: r.transport,
		Timeout:   60 * time.Second,
		CheckRedirect: func(next *http.Request, via []*http.Request) error {
			nu := next.URL
			if nu == nil || (nu.Scheme != "https" && nu.Scheme != "http") || nu.Host == "" || r.blockedUpstreamHost(next.Context(), nu.Hostname()) {
				return http.ErrUseLastResponse
			}
			nhost := strings.ToLower(nu.Host)
			if !allowed[nhost] {
				r.mu.Lock()
				if current := r.sessions[token]; current != nil {
					current.allowed[nhost] = true
				}
				r.mu.Unlock()
				allowed[nhost] = true
			}
			for _, k := range playbackHeaders {
				if v := sessionHeaders.Get(k); v != "" {
					next.Header.Set(k, v)
				}
			}
			return nil
		},
	}
	upstream, err := http.NewRequestWithContext(req.Context(), req.Method, u.String(), nil)
	if err != nil {
		return err
	}
	for _, k := range playbackHeaders {
		if v := sessionHeaders.Get(k); v != "" {
			upstream.Header.Set(k, v)
		}
	}
	if upstream.Header.Get("User-Agent") == "" {
		upstream.Header.Set("User-Agent", defaultUserAgent)
	}
	for _, k := range []string{"Range", "If-Range", "If-None-Match", "If-Modified-Since"} {
		if v := req.Header.Get(k); v != "" {
			upstream.Header.Set(k, v)
		}
	}
	upstream.Header.Set("Accept-Encoding", "identity")
	resp, err := client.Do(upstream)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if cookies := resp.Cookies(); len(cookies) > 0 {
		r.mu.Lock()
		if current := r.sessions[token]; current != nil {
			mergeResponseCookies(current.headers, cookies)
		}
		r.mu.Unlock()
	}
	log.Printf("[MediaResolver] Proxy upstream status=%d host=%s path=%s", resp.StatusCode, strings.ToLower(u.Host), u.Path)
	w.Header().Set("Cache-Control", "no-store")
	for _, k := range []string{"Content-Type", "Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"} {
		if v := resp.Header.Get(k); v != "" {
			w.Header().Set(k, v)
		}
	}
	isManifest := strings.Contains(strings.ToLower(resp.Header.Get("Content-Type")), "mpegurl") || strings.HasSuffix(strings.ToLower(u.Path), ".m3u8")
	if !isManifest {
		w.WriteHeader(resp.StatusCode)
		if req.Method != http.MethodHead {
			bufp := copyBufPool.Get().(*[]byte)
			_, _ = io.CopyBuffer(w, resp.Body, *bufp)
			copyBufPool.Put(bufp)
		}
		return nil
	}
	reader := resp.Body
	if strings.EqualFold(strings.TrimSpace(resp.Header.Get("Content-Encoding")), "gzip") {
		gz, gzErr := gzip.NewReader(resp.Body)
		if gzErr != nil {
			return fmt.Errorf("upstream returned an invalid gzip manifest: %w", gzErr)
		}
		defer gz.Close()
		reader = gz
	}
	data, err := io.ReadAll(io.LimitReader(reader, maxManifestBytes+1))
	if err != nil {
		return err
	}
	if len(data) > maxManifestBytes {
		return errors.New("upstream HLS manifest exceeds size limit")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		w.Header().Del("Content-Length")
		w.WriteHeader(resp.StatusCode)
		_, _ = w.Write(data)
		return nil
	}
	text := string(data)
	if !strings.HasPrefix(strings.TrimSpace(text), "#EXTM3U") {
		log.Printf("[MediaResolver] upstream HLS manifest is not plain HLS text host=%s path=%s content_encoding=%q bytes=%d", strings.ToLower(u.Host), u.Path, resp.Header.Get("Content-Encoding"), len(data))
	}
	rewritten, discovered := r.rewriteManifest(text, u, token, req)
	if len(discovered) > 0 {
		r.mu.Lock()
		if current := r.sessions[token]; current != nil {
			for h := range discovered {
				current.allowed[h] = true
			}
		}
		r.mu.Unlock()
	}
	w.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	w.Header().Del("Content-Length")
	w.Header().Del("Content-Range")
	w.WriteHeader(http.StatusOK)
	if req.Method != http.MethodHead {
		_, _ = io.WriteString(w, rewritten)
	}
	return nil
}

func isBlockedIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() ||
		ip.IsLinkLocalMulticast() || ip.IsMulticast() || ip.IsUnspecified() {
		return true
	}
	if ip4 := ip.To4(); ip4 != nil {
		return ip4[0] == 100 && ip4[1]&0xc0 == 0x40 ||
			ip4[0] == 198 && (ip4[1] == 18 || ip4[1] == 19) ||
			ip4[0] == 255 && ip4[1] == 255 && ip4[2] == 255 && ip4[3] == 255
	}
	return false
}

// blockedUpstreamHost reports whether a host must not be fetched upstream.
func (r *Resolver) blockedUpstreamHost(ctx context.Context, host string) bool {
	host = strings.TrimSpace(strings.ToLower(host))
	host = strings.Trim(host, "[]")
	if host == "" || host == "localhost" {
		return true
	}
	if ip := net.ParseIP(host); ip != nil {
		return isBlockedIP(ip)
	}
	if v, ok := r.blockCache.Load(host); ok {
		return v.(bool)
	}
	ips, err := net.DefaultResolver.LookupIP(ctx, "ip", host)
	if err != nil || len(ips) == 0 {
		return true // fail closed
	}
	blocked := false
	for _, ip := range ips {
		if isBlockedIP(ip) {
			blocked = true
			break
		}
	}
	if blocked {
		r.blockCache.Store(host, true)
	}
	return blocked
}

func cloneAllowed(in map[string]bool) map[string]bool {
	out := map[string]bool{}
	for k, v := range in {
		out[k] = v
	}
	return out
}

// redactQuery strips query strings from URLs before they are written to logs.
func redactQuery(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return "(unparseable URL)"
	}
	u.RawQuery = ""
	u.Fragment = ""
	return u.String()
}

var uriAttrRE = regexp.MustCompile(`URI="([^"]+)"`)

func (r *Resolver) rewriteManifest(text string, base *url.URL, token string, req *http.Request) (string, map[string]bool) {
	discovered := make(map[string]bool)

	// Clean root-relative proxy prefix: works reliably under HTTP, HTTPS, localhost, tunnels, and custom ports.
	proxyPrefix := "/api/media/proxy/" + token + ".m3u8?url="

	proxyURL := func(raw string) string {
		raw = strings.TrimSpace(raw)
		if raw == "" || strings.HasPrefix(raw, "/api/media/proxy/") {
			return raw
		}
		u := resolveMediaURL(base, raw)
		if u == "" {
			return raw
		}
		if pu, err := url.Parse(u); err == nil && pu.Host != "" {
			discovered[strings.ToLower(pu.Host)] = true
		}
		return proxyPrefix + url.QueryEscape(u)
	}

	text = forceHighestQuality(text)

	// Rewrite URI="..." attributes (EXT-X-MEDIA, EXT-X-KEY, EXT-X-MAP, etc.).
	text = uriAttrRE.ReplaceAllStringFunc(text, func(m string) string {
		parts := uriAttrRE.FindStringSubmatch(m)
		if len(parts) != 2 {
			return m
		}
		return `URI="` + proxyURL(parts[1]) + `"`
	})

	// Rewrite bare playlist/segment URI lines as well.
	lines := strings.Split(text, "\n")
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") || strings.HasPrefix(trimmed, "/api/media/proxy/") {
			continue
		}
		if strings.Contains(trimmed, " ") {
			continue
		}
		if u := resolveMediaURL(base, trimmed); u != "" {
			lines[i] = proxyURL(trimmed)
		}
	}
	return strings.Join(lines, "\n"), discovered
}

// bwRE extracts the BANDWIDTH value from an EXT-X-STREAM-INF line.
var bwRE = regexp.MustCompile(`BANDWIDTH=(\d+)`)

// resRE extracts the RESOLUTION value (e.g. 3840x2160, 1920x1080) from an EXT-X-STREAM-INF line.
var resRE = regexp.MustCompile(`RESOLUTION=(\d+)x(\d+)`)

// forceHighestQuality rewrites a master HLS playlist so that only the
// highest-quality video variant (4K UHD, 1080p Full HD, or highest bitrate) is retained.
// All metadata tags independent of the chosen variant (EXT-X-MEDIA audio/subtitles,
// EXT-X-SESSION-KEY, EXT-X-SESSION-DATA, EXT-X-I-FRAME-STREAM-INF) are preserved.
func forceHighestQuality(manifest string) string {
	if !strings.Contains(manifest, "#EXT-X-STREAM-INF") {
		return manifest
	}

	// Pass 1: find the highest-quality variant by resolution (pixels), with bandwidth
	// as a tiebreaker.
	maxBandwidth := -1
	maxPixels := -1
	var bestVariantLines []string

	lines := strings.Split(manifest, "\n")
	for i := 0; i < len(lines); i++ {
		trimmed := strings.TrimSpace(lines[i])
		if !strings.HasPrefix(trimmed, "#EXT-X-STREAM-INF") {
			continue
		}
		bw := 0
		if m := bwRE.FindStringSubmatch(trimmed); len(m) == 2 {
			bw, _ = strconv.Atoi(m[1])
		}
		pixels := 0
		if m := resRE.FindStringSubmatch(trimmed); len(m) == 3 {
			w, _ := strconv.Atoi(m[1])
			h, _ := strconv.Atoi(m[2])
			pixels = w * h
		}

		uriLine := ""
		for j := i + 1; j < len(lines); j++ {
			t := strings.TrimSpace(lines[j])
			if t == "" || strings.HasPrefix(t, "#") {
				continue
			}
			uriLine = lines[j]
			i = j
			break
		}

		// If no explicit RESOLUTION attribute was found, infer resolution from 4K/2K/1080p tags.
		if pixels == 0 {
			combined := strings.ToUpper(trimmed + " " + uriLine)
			if strings.Contains(combined, "4K") || strings.Contains(combined, "2160") || strings.Contains(combined, "UHD") {
				pixels = 3840 * 2160
			} else if strings.Contains(combined, "1440") || strings.Contains(combined, "2K") || strings.Contains(combined, "QHD") {
				pixels = 2560 * 1440
			} else if strings.Contains(combined, "1080") || strings.Contains(combined, "FHD") {
				pixels = 1920 * 1080
			} else if strings.Contains(combined, "720") || strings.Contains(combined, "HD") {
				pixels = 1280 * 720
			}
		}

		// Choose this variant if it has strictly higher pixel count (e.g. 4K > 1080p),
		// or equal pixel count with higher bandwidth.
		better := pixels > maxPixels || (pixels == maxPixels && bw > maxBandwidth)
		if better {
			maxBandwidth = bw
			maxPixels = pixels
			bestVariantLines = []string{trimmed, uriLine}
		}
	}

	// Pass 2: rebuild the manifest keeping all non-variant tags intact.
	var out []string
	for i := 0; i < len(lines); i++ {
		trimmed := strings.TrimSpace(lines[i])
		if strings.HasPrefix(trimmed, "#EXT-X-STREAM-INF") {
			for j := i + 1; j < len(lines); j++ {
				t := strings.TrimSpace(lines[j])
				if t == "" || strings.HasPrefix(t, "#") {
					continue
				}
				i = j
				break
			}
			continue
		}
		out = append(out, lines[i])
	}

	// Append the single highest quality variant.
	if len(bestVariantLines) > 0 {
		out = append(out, bestVariantLines[0])
		if bestVariantLines[1] != "" {
			out = append(out, bestVariantLines[1])
		}
	}
	return strings.Join(out, "\n")
}

func resolveMediaURL(base *url.URL, raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	u, e := url.Parse(raw)
	if e != nil {
		return ""
	}
	if !u.IsAbs() {
		u = base.ResolveReference(u)
	}
	if u.Host == "" {
		return ""
	}
	if u.Scheme != "https" && u.Scheme != "http" {
		return ""
	}
	return u.String()
}
