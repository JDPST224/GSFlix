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
	"strings"
	"sync"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

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
	TargetOrigin, VidKingOrigin             string
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
	for k, v := range map[string]string{"VIXSRC_ORIGIN": cfg.TargetOrigin, "VIDKING_ORIGIN": cfg.VidKingOrigin} {
		u, e := url.Parse(v)
		if e != nil || u.Scheme != "https" || u.Host == "" {
			return nil, fmt.Errorf("%s must be an HTTPS origin", k)
		}
		if (u.Path != "" && u.Path != "/") || u.RawQuery != "" || u.Fragment != "" {
			return nil, fmt.Errorf("%s must be a bare HTTPS origin (no path, query, or fragment)", k)
		}
	}
	return &Resolver{
		cfg:      cfg,
		sem:      make(chan struct{}, cfg.MaxBrowserSessions),
		sessions: make(map[string]*proxySession),
		transport: &http.Transport{
			Proxy:                 http.ProxyFromEnvironment,
			MaxIdleConns:          64,
			IdleConnTimeout:       90 * time.Second,
			TLSHandshakeTimeout:   10 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
		},
	}, nil
}

func (r *Resolver) Close() {
	r.mu.Lock()
	r.closed = true
	r.sessions = make(map[string]*proxySession)
	r.mu.Unlock()
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
	log.Printf("[MediaResolver] Resolving %s", redactQuery(target))
	ctx, cancel := context.WithTimeout(parent, r.cfg.SourceResolutionTimeout)
	defer cancel()
	source, headers, allowed, err := r.resolveInBrowser(ctx, target)
	if err != nil {
		return "", err
	}
	token, err := r.newSession(source, headers, allowed)
	if err != nil {
		return "", err
	}
	return "/api/media/proxy/" + token, nil
}

func (r *Resolver) targetURL(req MediaRequest) (string, error) {
	origin := r.cfg.TargetOrigin
	if strings.EqualFold(strings.TrimSpace(req.Provider), "vidking") {
		origin = r.cfg.VidKingOrigin
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
	if strings.EqualFold(strings.TrimSpace(req.Provider), "vidking") {
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
	opts := append([]chromedp.ExecAllocatorOption{}, chromedp.DefaultExecAllocatorOptions[:]...)
	opts = append(opts, chromedp.Flag("headless", r.cfg.BrowserHeadless), chromedp.Flag("disable-gpu", true), chromedp.Flag("no-first-run", true), chromedp.Flag("no-default-browser-check", true), chromedp.Flag("disable-quic", true))
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
		if len(requestHeaders) < 2048 {
			requestHeaders[e.Request.URL] = cloneHeader(h)
		}
		// Media CDNs may put the useful Cookie/Referer context on a later
		// segment request rather than the initial .m3u8 request. Retain the
		// latest safe browser headers per host so the proxy can reproduce the
		// playback context without exposing it to the frontend.
		if len(h) > 0 {
			hostHeaders[host] = cloneHeader(h)
		}
		mu.Unlock()
	})
	if strings.Contains(strings.ToLower(target), "vidking.net/embed/") {
		log.Printf("[MediaResolver] VidKing embed used only to discover its HLS manifest; frontend will receive the proxied HLS URL")
	}
	log.Printf("[MediaResolver] Navigating to media page")
	var navErr error
	for attempt := 1; attempt <= 3; attempt++ {
		navErr = chromedp.Run(ctx, network.Enable(), chromedp.Navigate(target))
		if navErr == nil {
			break
		}
		msg := navErr.Error()
		log.Printf("[MediaResolver] Navigation attempt %d/3 failed error=%v", attempt, navErr)
		// Some provider/CDN edges occasionally reset the initial document
		// connection. A second navigation in the same isolated browser context
		// is safe and lets Chromium establish a fresh connection. Do not retry
		// arbitrary application errors indefinitely.
		if !strings.Contains(strings.ToLower(msg), "err_connection_reset") {
			break
		}
		select {
		case <-parent.Done():
			return "", nil, nil, parent.Err()
		case <-time.After(time.Duration(attempt) * 500 * time.Millisecond):
		}
	}
	if navErr != nil {
		// A document load can report a reset after Chromium has already emitted
		// the media requests we need. Only treat it as fatal when no usable HLS
		// candidate was observed. This avoids discarding a valid playback source
		// because of a late page-load error.
		mu.Lock()
		hasCandidate := chooseCandidate(candidates).url != ""
		mu.Unlock()
		if !hasCandidate {
			return "", nil, nil, fmt.Errorf("navigation failed: %w", navErr)
		}
		log.Printf("[MediaResolver] Navigation reported an error but HLS requests were already captured; continuing error=%v", navErr)
	}
	log.Printf("[MediaResolver] Waiting for player")
	timer := time.NewTimer(2 * time.Second)
	select {
	case <-timer.C:
	case <-parent.Done():
		timer.Stop()
		return "", nil, nil, parent.Err()
	}
	ticker := time.NewTicker(200 * time.Millisecond)
	defer ticker.Stop()
	for {
		mu.Lock()
		c := chooseCandidate(candidates)
		if c.url != "" {
			merged := cloneHeader(c.headers)
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
		case <-ticker.C:
		}
	}
}

func isPotentialHLS(raw, mime string) bool {
	u, e := url.Parse(raw)
	if e != nil || u.Scheme != "https" || u.Host == "" {
		return false
	}
	p := strings.ToLower(u.Path)
	m := strings.ToLower(strings.TrimSpace(strings.Split(mime, ";")[0]))
	return strings.HasSuffix(p, ".m3u8") || m == "application/vnd.apple.mpegurl" || m == "application/x-mpegurl" || m == "audio/mpegurl"
}

func chooseCandidate(cs []hlsCandidate) hlsCandidate {
	// Probing variant playlists between ResponseReceived and LoadingFinished
	// can trigger provider-specific "invalid context" errors. Instead, choose
	// the URL that conventionally represents the master playlist. VixSrc
	// exposes its master as /playlist/, while other providers commonly use
	// /master.m3u8 or /manifest.m3u8.
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
		case strings.HasSuffix(strings.Split(lower, "?")[0], ".m3u8"):
			score = 50
		case strings.Contains(strings.ToLower(c.contentType), "mpegurl"):
			score = 40
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
	case "", "vixsrc", "vidking":
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
	// A Resolve that was already in flight when Close ran must not re-insert
	// sessions into the cleared map (they would leak forever).
	if r.closed {
		return "", errors.New("resolver is closed")
	}
	for tok, session := range r.sessions {
		if now.After(session.expiresAt) {
			delete(r.sessions, tok)
		}
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
	// Sliding expiration: active playback keeps the session alive. Without
	// this, long movies or live streams would die at the fixed expiry.
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
	if err != nil || u.Scheme != "https" || u.Host == "" {
		return errors.New("invalid upstream URL")
	}
	host := strings.ToLower(u.Host)
	if !allowed[host] {
		return errors.New("upstream host not allowed")
	}
	if r.blockedUpstreamHost(u.Hostname()) {
		return errors.New("upstream host blocked")
	}
	client := &http.Client{
		Transport: r.transport,
		Timeout:   60 * time.Second,
		CheckRedirect: func(next *http.Request, via []*http.Request) error {
			nu := next.URL
			if nu == nil || nu.Scheme != "https" || nu.Host == "" || r.blockedUpstreamHost(nu.Hostname()) {
				return http.ErrUseLastResponse
			}
			nhost := strings.ToLower(nu.Host)
			if !allowed[nhost] {
				// CDNs commonly 302 manifests/segments to edge hosts. Refusing
				// the redirect would hand the raw Location back to the browser,
				// which would then contact the CDN directly. Trust redirects
				// from an already-allowed host and remember the edge host so
				// later segment requests to it are allowed too.
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
	for _, k := range []string{"Range", "If-Range", "If-None-Match", "If-Modified-Since"} {
		if v := req.Header.Get(k); v != "" {
			upstream.Header.Set(k, v)
		}
	}
	// Ask the upstream HLS endpoint for an uncompressed response. The proxy
	// must receive a plain-text manifest so it can safely rewrite nested
	// playlist/segment URLs before returning it. (Edges that ignore this and
	// send gzip anyway are handled below.)
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
			_, _ = io.Copy(w, resp.Body)
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
		w.Header().Del("Content-Length") // length no longer matches after decompression
		w.WriteHeader(resp.StatusCode)
		_, _ = w.Write(data)
		return nil
	}
	text := string(data)
	if !strings.HasPrefix(strings.TrimSpace(text), "#EXTM3U") {
		log.Printf("[MediaResolver] upstream HLS manifest is not plain HLS text host=%s path=%s content_encoding=%q bytes=%d", strings.ToLower(u.Host), u.Path, resp.Header.Get("Content-Encoding"), len(data))
	}
	rewritten, discovered := r.rewriteManifest(text, u, token)
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
		// CGNAT and the benchmarking range are not publicly routable. They are
		// intentionally excluded by net.IP.IsPrivate, so block them explicitly
		// before a provider-controlled manifest can make the proxy fetch them.
		return ip4[0] == 100 && ip4[1]&0xc0 == 0x40 ||
			ip4[0] == 198 && (ip4[1] == 18 || ip4[1] == 19) ||
			ip4[0] == 255 && ip4[1] == 255 && ip4[2] == 255 && ip4[3] == 255
	}
	return false
}

// blockedUpstreamHost reports whether a host must not be fetched upstream.
// Besides literal IP checks it resolves hostnames so that DNS names pointing
// at loopback/private addresses (e.g. 127.0.0.1.nip.io) cannot bypass the
// SSRF guard. Failures fail closed but are not cached.
func (r *Resolver) blockedUpstreamHost(host string) bool {
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
	ips, err := net.DefaultResolver.LookupIP(context.Background(), "ip", host)
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
	// Cache only blocked names. Caching a successful DNS lookup would create a
	// DNS-rebinding window: a hostname could later resolve to an internal IP
	// while the proxy continued to trust the stale public result.
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

// redactQuery strips query strings (which often carry signed auth tokens)
// from URLs before they are written to logs.
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

func (r *Resolver) rewriteManifest(text string, base *url.URL, token string) (string, map[string]bool) {
	discovered := make(map[string]bool)
	proxyURL := func(raw string) string {
		u := resolveMediaURL(base, raw)
		if u == "" {
			return raw
		}
		if pu, err := url.Parse(u); err == nil {
			discovered[strings.ToLower(pu.Host)] = true
		}
		return "/api/media/proxy/" + token + "?url=" + url.QueryEscape(u)
	}

	// Rewrite URI="..." attributes (EXT-X-MEDIA, EXT-X-KEY, EXT-X-MAP, etc.).
	text = uriAttrRE.ReplaceAllStringFunc(text, func(m string) string {
		parts := uriAttrRE.FindStringSubmatch(m)
		if len(parts) != 2 {
			return m
		}
		return `URI="` + proxyURL(parts[1]) + `"`
	})

	// Rewrite bare playlist/segment URI lines as well. This is required for
	// HLS variant playlists and media segments such as init-*.mp4.
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

func resolveMediaURL(base *url.URL, raw string) string {
	u, e := url.Parse(raw)
	if e != nil {
		return ""
	}
	if !u.IsAbs() {
		u = base.ResolveReference(u)
	}
	if u.Scheme != "https" || u.Host == "" {
		return ""
	}
	return u.String()
}
