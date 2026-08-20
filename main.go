package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"movie/internal/mediaresolver"
)

var mediaSourceResolver *mediaresolver.Resolver

// tmdbHTTPClient is a shared client used for all TMDB API calls so that
// Go's built-in connection pool is reused across requests.
var tmdbHTTPClient = &http.Client{Timeout: 15 * time.Second}

type Movie struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Banner      string   `json:"banner"`
	Thumbnail   string   `json:"thumbnail"`
	Categories  []string `json:"categories"`
	Type        string   `json:"type"` // "movie" or "tv"
	Rating      float64  `json:"rating"`
	Year        string   `json:"year"`
	Genres      []string `json:"genres"`
}

type TMDBResponse struct {
	Results       []TMDBMovie `json:"results"`
	StatusMessage string      `json:"status_message"`
}

type TMDBMovie struct {
	ID            int     `json:"id"`
	Title         string  `json:"title"`
	OriginalTitle string  `json:"original_title"`
	Name          string  `json:"name"` // For TV shows
	Overview      string  `json:"overview"`
	BackdropPath  string  `json:"backdrop_path"`
	PosterPath    string  `json:"poster_path"`
	VoteAverage   float64 `json:"vote_average"`
	ReleaseDate   string  `json:"release_date"`
	FirstAirDate  string  `json:"first_air_date"`
	GenreIDs      []int   `json:"genre_ids"`
	MediaType     string  `json:"media_type,omitempty"`
}

func mapTMDBMovie(m TMDBMovie, defaultType string, categories []string) *Movie {
	title := m.Title
	if title == "" {
		title = m.OriginalTitle
	}
	if title == "" {
		title = m.Name
	}

	if title == "" || m.PosterPath == "" {
		return nil
	}

	banner := ""
	if m.BackdropPath != "" {
		banner = "https://image.tmdb.org/t/p/original" + m.BackdropPath
	} else {
		banner = "https://image.tmdb.org/t/p/w1280" + m.PosterPath
	}

	thumbnail := "https://image.tmdb.org/t/p/w500" + m.PosterPath

	var genres []string
	for _, gid := range m.GenreIDs {
		if name, ok := tmdbGenres[gid]; ok {
			genres = append(genres, name)
		}
	}

	year := ""
	if m.ReleaseDate != "" && len(m.ReleaseDate) >= 4 {
		year = m.ReleaseDate[:4]
	} else if m.FirstAirDate != "" && len(m.FirstAirDate) >= 4 {
		year = m.FirstAirDate[:4]
	}
	
	mType := defaultType
	if m.MediaType != "" {
		mType = m.MediaType
	}

	return &Movie{
		ID:          fmt.Sprintf("%d", m.ID),
		Title:       title,
		Description: m.Overview,
		Banner:      banner,
		Thumbnail:   thumbnail,
		Categories:  categories,
		Type:        mType,
		Rating:      m.VoteAverage,
		Year:        year,
		Genres:      genres,
	}
}

var tmdbGenres = map[int]string{
	28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
	10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
}

var cachedMovies []Movie
var cachedTVShows []Movie
var cachedPopular []Movie
var cacheMutex sync.RWMutex
var tvMutex sync.RWMutex
var popularMutex sync.RWMutex
var moviesRefreshMu sync.Mutex
var tvRefreshMu sync.Mutex
var popularRefreshMu sync.Mutex
var tmdbToken string  // Bearer Read Access Token
var tmdbAPIKey string // v3 API key (fallback)

func loadConfig(path string) (mediaresolver.Config, error) {
	cfg := mediaresolver.Config{
		TargetOrigin:            "https://vixsrc.to",
		VidKingOrigin:           "https://www.vidking.net",
		BrowserHeadless:         true,
		BrowserTimeout:          45 * time.Second,
		SourceResolutionTimeout: 20 * time.Second,
		MaxBrowserSessions:      3,
	}

	file, err := os.Open(path)
	if err != nil {
		return cfg, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		switch key {
		case "TMDB_ACCESS_TOKEN":
			tmdbToken = cleanConfigValue(val)
		case "TMDB_API_KEY":
			tmdbAPIKey = cleanConfigValue(val)
		case "BROWSER_HEADLESS":
			if v, err := strconv.ParseBool(val); err == nil {
				cfg.BrowserHeadless = v
			}
		case "BROWSER_TIMEOUT":
			if v, err := time.ParseDuration(val); err == nil && v > 0 {
				cfg.BrowserTimeout = v
			}
		case "SOURCE_RESOLUTION_TIMEOUT":
			if v, err := time.ParseDuration(val); err == nil && v > 0 {
				cfg.SourceResolutionTimeout = v
			}
		case "MAX_BROWSER_SESSIONS":
			if v, err := strconv.Atoi(val); err == nil && v > 0 {
				cfg.MaxBrowserSessions = v
			}
		case "BROWSER_EXECUTABLE":
			cfg.BrowserExecutable = val
		case "VIXSRC_ORIGIN":
			cfg.TargetOrigin = cleanConfigValue(val)
		case "VIDKING_ORIGIN":
			cfg.VidKingOrigin = cleanConfigValue(val)
		}
	}

	if err := scanner.Err(); err != nil {
		return cfg, err
	}

	// Environment variables remain supported as explicit runtime overrides.
	if v := os.Getenv("BROWSER_HEADLESS"); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			cfg.BrowserHeadless = b
		}
	}
	if v := os.Getenv("BROWSER_TIMEOUT"); v != "" {
		if d, err := time.ParseDuration(v); err == nil && d > 0 {
			cfg.BrowserTimeout = d
		}
	}
	if v := os.Getenv("SOURCE_RESOLUTION_TIMEOUT"); v != "" {
		if d, err := time.ParseDuration(v); err == nil && d > 0 {
			cfg.SourceResolutionTimeout = d
		}
	}
	if v := os.Getenv("MAX_BROWSER_SESSIONS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			cfg.MaxBrowserSessions = n
		}
	}
	if v := os.Getenv("BROWSER_EXECUTABLE"); v != "" {
		cfg.BrowserExecutable = v
	}
	if v := os.Getenv("VIXSRC_ORIGIN"); v != "" {
		cfg.TargetOrigin = v
	}
	if v := os.Getenv("VIDKING_ORIGIN"); v != "" {
		cfg.VidKingOrigin = v
	}

	// Environment variables are explicit runtime overrides. Only override
	// values loaded from config.conf when the variable is actually set.
	if v := os.Getenv("TMDB_ACCESS_TOKEN"); strings.TrimSpace(v) != "" {
		tmdbToken = cleanConfigValue(v)
	}
	if v := os.Getenv("TMDB_API_KEY"); strings.TrimSpace(v) != "" {
		tmdbAPIKey = cleanConfigValue(v)
	}

	return cfg, nil
}

// cleanConfigValue trims whitespace and optional single/double quotes around
// configuration values, making both KEY=value and KEY="value" work.
func cleanConfigValue(v string) string {
	v = strings.TrimSpace(v)
	if len(v) >= 2 {
		if (v[0] == '"' && v[len(v)-1] == '"') ||
			(v[0] == '\'' && v[len(v)-1] == '\'') {
			v = strings.TrimSpace(v[1 : len(v)-1])
		}
	}
	return v
}

func buildURL(endpoint string) string {
	if tmdbAPIKey != "" && tmdbToken == "" {
		sep := "?"
		if strings.Contains(endpoint, "?") {
			sep = "&"
		}
		return "https://api.themoviedb.org/3" + endpoint + sep + "api_key=" + tmdbAPIKey
	}
	return "https://api.themoviedb.org/3" + endpoint
}

func fetchTMDB(endpoint string, categories []string, mediaType string) []Movie {
	if tmdbToken == "" && tmdbAPIKey == "" {
		log.Println("No TMDB credentials, skipping fetch for", endpoint)
		return nil
	}

	rawURL := buildURL(endpoint)
	req, err := http.NewRequest("GET", rawURL, nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return nil
	}

	req.Header.Add("accept", "application/json")
	if tmdbToken != "" {
		req.Header.Add("Authorization", "Bearer "+tmdbToken)
	}

	res, err := tmdbHTTPClient.Do(req)
	if err != nil {
		log.Println("Error fetching TMDB data:", err)
		return nil
	}
	defer res.Body.Close()

	// Cap response size to prevent OOM from unexpected large responses.
	body, err := io.ReadAll(io.LimitReader(res.Body, 10<<20))
	if err != nil {
		log.Println("Error reading response body:", err)
		return nil
	}

	if res.StatusCode != http.StatusOK {
		log.Printf("TMDB API error for %s: status=%d body=%s\n", endpoint, res.StatusCode, string(body))
		return nil
	}

	var tmdbRes TMDBResponse
	if err := json.Unmarshal(body, &tmdbRes); err != nil {
		log.Println("Error unmarshaling TMDB JSON:", err)
		return nil
	}

	if tmdbRes.StatusMessage != "" {
		log.Printf("TMDB status message for %s: %s\n", endpoint, tmdbRes.StatusMessage)
	}

	var movies []Movie
	for _, m := range tmdbRes.Results {
		mapped := mapTMDBMovie(m, mediaType, categories)
		if mapped != nil {
			movies = append(movies, *mapped)
		}
	}

	log.Printf("Fetched %d items for %v (%s)\n", len(movies), categories, mediaType)
	return movies
}

type tmdbTask struct {
	endpoint   string
	categories []string
	mediaType  string
}

func fetchTMDBTasks(tasks []tmdbTask) []Movie {
	results := make([][]Movie, len(tasks))
	var wg sync.WaitGroup
	for i, t := range tasks {
		wg.Add(1)
		go func(i int, t tmdbTask) {
			defer wg.Done()
			results[i] = fetchTMDB(t.endpoint, t.categories, t.mediaType)
		}(i, t)
	}
	wg.Wait()
	var all []Movie
	for _, movies := range results {
		all = append(all, movies...)
	}
	return all
}

func updateMoviesCache() {
	if !moviesRefreshMu.TryLock() {
		log.Println("Movies cache refresh already in progress; skipping overlapping refresh")
		return
	}
	defer moviesRefreshMu.Unlock()

	log.Println("Refreshing movies cache...")
	allMovies := fetchTMDBTasks([]tmdbTask{
		{"/trending/movie/day?language=en-US", []string{"Trending Now"}, "movie"},
		{"/movie/popular?language=en-US&page=1", []string{"Popular"}, "movie"},
		{"/movie/top_rated?language=en-US&page=1", []string{"Top Rated"}, "movie"},
		{"/movie/now_playing?language=en-US&page=1", []string{"Now Playing"}, "movie"},
		{"/movie/upcoming?language=en-US&page=1", []string{"Upcoming"}, "movie"},
		{"/discover/movie?with_genres=28&language=en-US&page=1&sort_by=popularity.desc", []string{"Action"}, "movie"},
		{"/discover/movie?with_genres=35&language=en-US&page=1&sort_by=popularity.desc", []string{"Comedy"}, "movie"},
		{"/discover/movie?with_genres=27&language=en-US&page=1&sort_by=popularity.desc", []string{"Horror"}, "movie"},
		{"/discover/movie?with_genres=878&language=en-US&page=1&sort_by=popularity.desc", []string{"Sci-Fi"}, "movie"},
		{"/discover/movie?with_genres=10749&language=en-US&page=1&sort_by=popularity.desc", []string{"Romance"}, "movie"},
		{"/discover/movie?with_genres=16&language=en-US&page=1&sort_by=popularity.desc", []string{"Animation"}, "movie"},
	})

	cacheMutex.Lock()
	if len(allMovies) > 0 {
		cachedMovies = allMovies
		log.Printf("Movies cache updated: %d total\n", len(allMovies))
	} else {
		log.Println("Warning: movie fetch returned 0 movies, keeping old cache")
	}
	cacheMutex.Unlock()
}

func updateTVShowsCache() {
	if !tvRefreshMu.TryLock() {
		log.Println("TV cache refresh already in progress; skipping overlapping refresh")
		return
	}
	defer tvRefreshMu.Unlock()

	log.Println("Refreshing TV shows cache...")
	allShows := fetchTMDBTasks([]tmdbTask{
		{"/trending/tv/day?language=en-US", []string{"Trending TV"}, "tv"},
		{"/tv/popular?language=en-US&page=1", []string{"Popular Shows"}, "tv"},
		{"/tv/top_rated?language=en-US&page=1", []string{"Top Rated Shows"}, "tv"},
		{"/tv/on_the_air?language=en-US&page=1", []string{"Now Airing"}, "tv"},
		{"/discover/tv?with_genres=10759&language=en-US&page=1&sort_by=popularity.desc", []string{"Action & Adventure"}, "tv"},
		{"/discover/tv?with_genres=18&language=en-US&page=1&sort_by=popularity.desc", []string{"Drama"}, "tv"},
		{"/discover/tv?with_genres=35&language=en-US&page=1&sort_by=popularity.desc", []string{"Comedy Shows"}, "tv"},
		{"/discover/tv?with_genres=9648&language=en-US&page=1&sort_by=popularity.desc", []string{"Mystery"}, "tv"},
		{"/discover/tv?with_genres=10765&language=en-US&page=1&sort_by=popularity.desc", []string{"Sci-Fi & Fantasy"}, "tv"},
		{"/discover/tv?with_genres=16&language=en-US&page=1&sort_by=popularity.desc", []string{"Anime"}, "tv"},
	})

	tvMutex.Lock()
	if len(allShows) > 0 {
		cachedTVShows = allShows
		log.Printf("TV shows cache updated: %d total\n", len(allShows))
	} else {
		log.Println("Warning: TV fetch returned 0 shows, keeping old cache")
	}
	tvMutex.Unlock()
}

func updatePopularCache() {
	if !popularRefreshMu.TryLock() {
		log.Println("Popular cache refresh already in progress; skipping overlapping refresh")
		return
	}
	defer popularRefreshMu.Unlock()

	log.Println("Refreshing popular/new cache...")
	all := fetchTMDBTasks([]tmdbTask{
		{"/trending/movie/week?language=en-US", []string{"Trending Movies"}, "movie"},
		{"/trending/tv/week?language=en-US", []string{"Trending Shows"}, "tv"},
		{"/movie/now_playing?language=en-US&page=1", []string{"New in Cinemas"}, "movie"},
		{"/tv/on_the_air?language=en-US&page=1", []string{"New Episodes"}, "tv"},
	})

	popularMutex.Lock()
	if len(all) > 0 {
		cachedPopular = all
		log.Printf("Popular cache updated: %d total\n", len(all))
	}
	popularMutex.Unlock()
}

// ── Dynamic media source resolver ───────────────────────────────────────────
func mediaMovieSourceHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		writeMediaError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/media/source/movie/")
	if !validMediaID(id) {
		writeMediaError(w, http.StatusBadRequest, "Invalid movie ID")
		return
	}
	source, err := mediaSourceResolver.Resolve(r.Context(), mediaresolver.MediaRequest{Type: mediaresolver.Movie, ID: id, Provider: "vixsrc"})
	if err != nil {
		log.Printf("[MediaResolver] movie resolution failed id=%s error=%v", id, err)
		writeMediaError(w, http.StatusBadGateway, "Unable to resolve media source")
		return
	}
	writeMediaJSON(w, http.StatusOK, map[string]any{"success": true, "type": "hls", "url": source})
}

func mediaTVSourceHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", http.MethodGet)
		writeMediaError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path[len("/api/media/source/tv/"):], "/"), "/")
	if len(parts) != 3 || !validMediaID(parts[0]) || !validMediaID(parts[1]) || !validMediaID(parts[2]) {
		writeMediaError(w, http.StatusBadRequest, "Invalid TV episode parameters")
		return
	}
	source, err := mediaSourceResolver.Resolve(r.Context(), mediaresolver.MediaRequest{Type: mediaresolver.TV, ID: parts[0], Season: parts[1], Episode: parts[2], Provider: "vixsrc"})
	if err != nil {
		log.Printf("[MediaResolver] TV resolution failed id=%s season=%s episode=%s error=%v", parts[0], parts[1], parts[2], err)
		writeMediaError(w, http.StatusBadGateway, "Unable to resolve media source")
		return
	}
	writeMediaJSON(w, http.StatusOK, map[string]any{"success": true, "type": "hls", "url": source})
}

func mediaProviderMovieSourceHandler(provider string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeMediaError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		id := strings.TrimPrefix(r.URL.Path, "/api/media/source/"+provider+"/movie/")
		if !validMediaID(id) {
			writeMediaError(w, http.StatusBadRequest, "Invalid movie ID")
			return
		}
		source, err := mediaSourceResolver.Resolve(r.Context(), mediaresolver.MediaRequest{Type: mediaresolver.Movie, ID: id, Provider: provider})
		if err != nil {
			log.Printf("[MediaResolver] %s movie resolution failed id=%s error=%v", provider, id, err)
			writeMediaError(w, http.StatusBadGateway, "Unable to resolve media source")
			return
		}
		writeMediaJSON(w, http.StatusOK, map[string]any{"success": true, "type": "hls", "url": source})
	}
}

func mediaProviderTVSourceHandler(provider string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeMediaError(w, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
		prefix := "/api/media/source/" + provider + "/tv/"
		parts := strings.Split(strings.Trim(r.URL.Path[len(prefix):], "/"), "/")
		if len(parts) != 3 || !validMediaID(parts[0]) || !validMediaID(parts[1]) || !validMediaID(parts[2]) {
			writeMediaError(w, http.StatusBadRequest, "Invalid TV episode parameters")
			return
		}
		source, err := mediaSourceResolver.Resolve(r.Context(), mediaresolver.MediaRequest{Type: mediaresolver.TV, ID: parts[0], Season: parts[1], Episode: parts[2], Provider: provider})
		if err != nil {
			log.Printf("[MediaResolver] %s TV resolution failed id=%s season=%s episode=%s error=%v", provider, parts[0], parts[1], parts[2], err)
			writeMediaError(w, http.StatusBadGateway, "Unable to resolve media source")
			return
		}
		writeMediaJSON(w, http.StatusOK, map[string]any{"success": true, "type": "hls", "url": source})
	}
}

func mediaProxyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", http.MethodGet+", "+http.MethodHead)
		writeMediaError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	const prefix = "/api/media/proxy/"
	if !strings.HasPrefix(r.URL.Path, prefix) {
		writeMediaError(w, http.StatusNotFound, "Not found")
		return
	}
	token := strings.Trim(strings.TrimPrefix(r.URL.Path, prefix), "/")
	token = strings.TrimSuffix(token, ".m3u8")
	if token == "" {
		writeMediaError(w, http.StatusBadRequest, "Invalid proxy token")
		return
	}
	if err := mediaSourceResolver.Proxy(w, r, token); err != nil {
		log.Printf("[MediaResolver] proxy failed: %v", err)
		writeMediaError(w, http.StatusBadGateway, "Unable to proxy media source")
	}
}

func validMediaID(s string) bool {
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

func writeMediaJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeMediaError(w http.ResponseWriter, status int, message string) {
	writeMediaJSON(w, status, map[string]any{"success": false, "error": message})
}

// ── Handlers ────────────────────────────────────────────────────────────────

func moviesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	cacheMutex.RLock()
	movies := cachedMovies
	cacheMutex.RUnlock()
	if movies == nil {
		movies = []Movie{}
	}
	json.NewEncoder(w).Encode(movies)
}

func tvShowsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	tvMutex.RLock()
	shows := cachedTVShows
	tvMutex.RUnlock()
	if shows == nil {
		shows = []Movie{}
	}
	json.NewEncoder(w).Encode(shows)
}

func popularHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	popularMutex.RLock()
	pop := cachedPopular
	popularMutex.RUnlock()
	if pop == nil {
		pop = []Movie{}
	}
	json.NewEncoder(w).Encode(pop)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	cacheMutex.RLock()
	movies := cachedMovies
	cacheMutex.RUnlock()

	tvMutex.RLock()
	shows := cachedTVShows
	tvMutex.RUnlock()

	// Collect movies by category
	moviesBycat := map[string][]Movie{}
	for _, m := range movies {
		for _, c := range m.Categories {
			moviesBycat[c] = append(moviesBycat[c], m)
		}
	}

	// Collect TV by category
	tvBycat := map[string][]Movie{}
	for _, m := range shows {
		for _, c := range m.Categories {
			tvBycat[c] = append(tvBycat[c], m)
		}
	}

	// Interleave: trending movies, trending TV, popular movies, popular TV, then genres
	order := []struct{ cat, src string }{
		{"Trending Movies", "movie"},
		{"Trending TV", "tv"},
		{"Popular Movies", "movie"},
		{"Popular Shows", "tv"},
		{"Top Rated Movies", "movie"},
		{"Top Rated Shows", "tv"},
		{"Now Playing", "movie"},
		{"Now Airing", "tv"},
		{"Upcoming", "movie"},
		{"Action", "movie"},
		{"Action & Adventure", "tv"},
		{"Comedy", "movie"},
		{"Comedy Shows", "tv"},
		{"Horror", "movie"},
		{"Sci-Fi", "movie"},
		{"Sci-Fi & Fantasy", "tv"},
		{"Drama", "tv"},
		{"Mystery", "tv"},
		{"Romance", "movie"},
		{"Animation", "movie"},
		{"Anime", "tv"},
	}

	// Cache tags do not always match the Home row labels.
	if items, ok := moviesBycat["Trending Now"]; ok {
		moviesBycat["Trending Movies"] = append(moviesBycat["Trending Movies"], items...)
	}
	if items, ok := moviesBycat["Popular"]; ok {
		moviesBycat["Popular Movies"] = append(moviesBycat["Popular Movies"], items...)
	}
	if items, ok := moviesBycat["Top Rated"]; ok {
		moviesBycat["Top Rated Movies"] = append(moviesBycat["Top Rated Movies"], items...)
	}

	var combined []Movie
	seen := map[string]bool{}

	for _, o := range order {
		var src map[string][]Movie
		if o.src == "movie" {
			src = moviesBycat
		} else {
			src = tvBycat
		}
		for _, m := range src[o.cat] {
			key := m.Type + "-" + m.ID
			if seen[key] {
				continue
			}
			seen[key] = true
			// Re-label with the home category name
			m.Categories = []string{o.cat}
			combined = append(combined, m)
		}
	}

	if combined == nil {
		combined = []Movie{}
	}
	json.NewEncoder(w).Encode(combined)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if tmdbToken == "" && tmdbAPIKey == "" {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode([]Movie{})
		return
	}

	query := strings.TrimSpace(r.URL.Query().Get("q"))
	mediaType := strings.TrimSpace(r.URL.Query().Get("type")) // "movie", "tv", or "" (multi)

	if query == "" {
		json.NewEncoder(w).Encode([]Movie{})
		return
	}

	encoded := url.QueryEscape(query)
	var results []Movie

	switch mediaType {
	case "tv":
		results = fetchTMDB("/search/tv?query="+encoded+"&language=en-US&page=1", []string{"Search"}, "tv")
	case "movie":
		results = fetchTMDB("/search/movie?query="+encoded+"&language=en-US&page=1", []string{"Search"}, "movie")
	default:
		// multi search — returns both movies and TV; map type from TMDB's media_type field
		results = fetchMultiSearch(encoded)
	}

	if results == nil {
		results = []Movie{}
	}
	json.NewEncoder(w).Encode(results)
}

// fetchMultiSearch hits /search/multi and returns movies + TV shows
func fetchMultiSearch(encodedQuery string) []Movie {
	if tmdbToken == "" && tmdbAPIKey == "" {
		return nil
	}

	endpoint := "/search/multi?query=" + encodedQuery + "&language=en-US&page=1"
	rawURL := buildURL(endpoint)

	req, err := http.NewRequest("GET", rawURL, nil)
	if err != nil {
		return nil
	}
	req.Header.Add("accept", "application/json")
	if tmdbToken != "" {
		req.Header.Add("Authorization", "Bearer "+tmdbToken)
	}

	res, err := tmdbHTTPClient.Do(req)
	if err != nil {
		return nil
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 10<<20))
	if err != nil {
		return nil
	}
	if res.StatusCode != http.StatusOK {
		return nil
	}

	var raw TMDBResponse

	if err := json.Unmarshal(body, &raw); err != nil {
		return nil
	}

	var movies []Movie
	categories := []string{"Search Results"}
	for _, m := range raw.Results {
		if m.MediaType != "movie" && m.MediaType != "tv" {
			continue
		}
		mapped := mapTMDBMovie(m, m.MediaType, categories)
		if mapped != nil {
			movies = append(movies, *mapped)
		}
	}
	return movies
}

// ── Detail Handler ──────────────────────────────────────────────────────────

func detailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if tmdbToken == "" && tmdbAPIKey == "" {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte(`{}`))
		return
	}

	mediaType := strings.TrimSpace(r.URL.Query().Get("type"))
	id := strings.TrimSpace(r.URL.Query().Get("id"))

	if !validMediaID(id) || (mediaType != "movie" && mediaType != "tv") {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{}`))
		return
	}

	var endpoint string
	if mediaType == "movie" {
		endpoint = fmt.Sprintf("/movie/%s", id)
	} else {
		endpoint = fmt.Sprintf("/tv/%s", id)
	}

	rawURL := buildURL(endpoint)
	u, err := url.Parse(rawURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{}`))
		return
	}
	q := u.Query()
	q.Set("append_to_response", "credits,videos,recommendations")
	q.Set("language", "en-US")
	u.RawQuery = q.Encode()

	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{}`))
		return
	}
	req.Header.Add("accept", "application/json")
	if tmdbToken != "" {
		req.Header.Add("Authorization", "Bearer "+tmdbToken)
	}

	res, err := tmdbHTTPClient.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{}`))
		return
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{}`))
		return
	}

	body, err := io.ReadAll(io.LimitReader(res.Body, 10<<20))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{}`))
		return
	}

	w.Write(body)
}

// ── Episodes Handler ─────────────────────────────────────────────────────────

func episodesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if tmdbToken == "" && tmdbAPIKey == "" {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte(`{}`))
		return
	}

	id := strings.TrimSpace(r.URL.Query().Get("id"))
	season := strings.TrimSpace(r.URL.Query().Get("season"))
	if !validMediaID(id) || !validMediaID(season) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{}`))
		return
	}

	endpoint := fmt.Sprintf("/tv/%s/season/%s?language=en-US", id, season)
	rawURL := buildURL(endpoint)

	req, err := http.NewRequest("GET", rawURL, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{}`))
		return
	}
	req.Header.Add("accept", "application/json")
	if tmdbToken != "" {
		req.Header.Add("Authorization", "Bearer "+tmdbToken)
	}

	res, err := tmdbHTTPClient.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{}`))
		return
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{}`))
		return
	}

	body, err := io.ReadAll(io.LimitReader(res.Body, 10<<20))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{}`))
		return
	}

	w.Write(body)
}

func main() {
	cfg, configErr := loadConfig("config.conf")
	if configErr != nil {
		log.Fatal("Failed to load config.conf: ", configErr)
	}

	var resolverErr error
	mediaSourceResolver, resolverErr = mediaresolver.New(cfg)
	if resolverErr != nil {
		log.Fatal("Failed to initialize media source resolver: ", resolverErr)
	}

	if tmdbToken == "" && tmdbAPIKey == "" {
		log.Println("WARNING: No TMDB credentials in config.conf")
		log.Println("Set TMDB_ACCESS_TOKEN (Bearer token) or TMDB_API_KEY")
	} else {
		if tmdbToken != "" {
			log.Println("Using TMDB Bearer access token")
		} else {
			log.Println("Using TMDB API key")
		}

		// Initial fetch (all caches in parallel)
		done := make(chan struct{}, 3)
		go func() { updateMoviesCache(); done <- struct{}{} }()
		go func() { updateTVShowsCache(); done <- struct{}{} }()
		go func() { updatePopularCache(); done <- struct{}{} }()
		<-done
		<-done
		<-done

		// Auto-refresh every 30 minutes
		go func() {
			ticker := time.NewTicker(30 * time.Minute)
			defer ticker.Stop()
			for range ticker.C {
				go updateMoviesCache()
				go updateTVShowsCache()
				go updatePopularCache()
			}
		}()
	}

	http.HandleFunc("/api/home", homeHandler)
	http.HandleFunc("/api/movies", moviesHandler)
	http.HandleFunc("/api/tvshows", tvShowsHandler)
	http.HandleFunc("/api/popular", popularHandler)
	http.HandleFunc("/api/search", searchHandler)
	http.HandleFunc("/api/detail", detailHandler)
	http.HandleFunc("/api/episodes", episodesHandler)
	// Provider-specific resolver routes. Keep VixSrc as the default provider,
	// while retaining the legacy routes below for backwards compatibility.
	http.HandleFunc("/api/media/source/vixsrc/movie/", mediaProviderMovieSourceHandler("vixsrc"))
	http.HandleFunc("/api/media/source/vixsrc/tv/", mediaProviderTVSourceHandler("vixsrc"))
	http.HandleFunc("/api/media/source/vidking/movie/", mediaProviderMovieSourceHandler("vidking"))
	http.HandleFunc("/api/media/source/vidking/tv/", mediaProviderTVSourceHandler("vidking"))
	http.HandleFunc("/api/media/source/movie/", mediaMovieSourceHandler)
	http.HandleFunc("/api/media/source/tv/", mediaTVSourceHandler)
	http.HandleFunc("/api/media/proxy/", mediaProxyHandler)
	http.Handle("/", http.FileServer(http.Dir("./static")))

	server := &http.Server{
		Addr:              ":8080",
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      120 * time.Second, // covers streaming proxy responses
		IdleTimeout:       90 * time.Second,
	}

	// Graceful shutdown: wait for SIGTERM or SIGINT, then cleanly drain active
	// connections and release browser sessions before exiting.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	go func() {
		log.Println("Server listening on :8080 — open http://localhost:8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Error starting server: ", err)
		}
	}()

	<-ctx.Done()
	log.Println("Shutdown signal received — draining connections...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}
	mediaSourceResolver.Close()
	log.Println("Server stopped cleanly.")
}
