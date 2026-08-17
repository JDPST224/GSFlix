package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	TargetOrigin            string
	BrowserHeadless         bool
	BrowserTimeout          time.Duration
	SourceResolutionTimeout time.Duration
	MaxBrowserSessions      int
	SourceCacheTTL          time.Duration
	BrowserExecutable       string
}

func Load() Config {
	return Config{
		TargetOrigin:            env("TARGET_ORIGIN", "https://vixsrc.to"),
		BrowserHeadless:         envBool("BROWSER_HEADLESS", true),
		BrowserTimeout:          envDuration("BROWSER_TIMEOUT", 30*time.Second),
		SourceResolutionTimeout: envDuration("SOURCE_RESOLUTION_TIMEOUT", 20*time.Second),
		MaxBrowserSessions:      envInt("MAX_BROWSER_SESSIONS", 3),
		SourceCacheTTL:          envDuration("SOURCE_CACHE_TTL", 60*time.Second),
		BrowserExecutable:       os.Getenv("BROWSER_EXECUTABLE"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
func envBool(key string, fallback bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return b
}
func envInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil || n < 1 {
		return fallback
	}
	return n
}
func envDuration(key string, fallback time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	d, err := time.ParseDuration(v)
	if err != nil || d <= 0 {
		return fallback
	}
	return d
}
