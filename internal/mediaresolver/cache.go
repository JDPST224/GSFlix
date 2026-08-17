package mediaresolver

import (
	"sync"
	"time"
)

type cacheEntry struct {
	url       string
	expiresAt time.Time
}

type sourceCache struct {
	mu  sync.Mutex
	ttl time.Duration
	m   map[string]cacheEntry
}

func newSourceCache(ttl time.Duration) *sourceCache {
	return &sourceCache{ttl: ttl, m: make(map[string]cacheEntry)}
}
func (c *sourceCache) get(key string) (string, bool) {
	if c.ttl <= 0 {
		return "", false
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.m[key]
	if !ok || time.Now().After(e.expiresAt) {
		delete(c.m, key)
		return "", false
	}
	return e.url, true
}
func (c *sourceCache) put(key, u string) {
	if c.ttl <= 0 {
		return
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	c.m[key] = cacheEntry{url: u, expiresAt: time.Now().Add(c.ttl)}
}
