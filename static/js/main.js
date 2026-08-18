document.addEventListener('DOMContentLoaded', () => {
    // ─── DOM References ──────────────────────────────────────────────────────
    const navbar              = document.getElementById('navbar');
    const hero                = document.getElementById('hero');
    const heroClickArea       = document.getElementById('hero-click-area');
    const heroTitle           = document.getElementById('hero-title');
    const heroDesc            = document.getElementById('hero-desc');
    const heroMetaRow         = document.getElementById('hero-meta-row');
    const heroPlay            = document.getElementById('hero-play');
    const heroInfo            = document.getElementById('hero-info');
    const heroAddList         = document.getElementById('hero-add-list');
    const heroDots            = document.getElementById('hero-dots');
    const carouselsContainer  = document.getElementById('carousels-container');
    const mylistEmpty         = document.getElementById('mylist-empty');
    const mylistBrowseBtn     = document.getElementById('mylist-browse-btn');

    // Player
    const playerModal         = document.getElementById('player-modal');
    const closePlayer         = document.getElementById('close-player');
    const vixPlayer           = document.getElementById('vix-player');
    const vidkingPlayer        = document.getElementById('vidking-player');
    const playerMovieTitle    = document.getElementById('player-movie-title');
    const playerControlsTop   = document.getElementById('player-controls-top');
    const playerLoader        = document.getElementById('player-loader');
    const playerNextEp        = document.getElementById('player-next-ep');
    const playerEpListBtn     = document.getElementById('player-ep-list-btn');
    const playerEpPanel       = document.getElementById('player-ep-panel');
    const playerEpSeasonSelect= document.getElementById('player-ep-season-select');
    const playerEpPanelClose  = document.getElementById('player-ep-panel-close');
    const playerEpList        = document.getElementById('player-ep-list');
    const playerEpLoading     = document.getElementById('player-ep-loading');
    const playerServerSelect  = document.getElementById('player-server-select');
    const playerServerPicker  = document.getElementById('player-server-picker');
    const playerServerTrigger = document.getElementById('player-server-trigger');
    const playerServerCurrent = document.getElementById('player-server-current');
    const playerServerMenu    = document.getElementById('player-server-menu');
    const playerAudioPicker   = document.getElementById('player-audio-picker');
    const playerAudioTrigger  = document.getElementById('player-audio-trigger');
    const playerAudioCurrent  = document.getElementById('player-audio-current');
    const playerAudioMenu     = document.getElementById('player-audio-menu');
    const playerSubtitlePicker  = document.getElementById('player-subtitle-picker');
    const playerSubtitleTrigger = document.getElementById('player-subtitle-trigger');
    const playerSubtitleCurrent = document.getElementById('player-subtitle-current');
    const playerSubtitleMenu    = document.getElementById('player-subtitle-menu');
    const playerSeasonPicker  = document.getElementById('player-season-picker');
    const playerSeasonTrigger = document.getElementById('player-season-trigger');
    const playerSeasonCurrent = document.getElementById('player-season-current');
    const playerSeasonMenu    = document.getElementById('player-season-menu');
    const playerControlsBottom= document.getElementById('player-controls-bottom');
    const playerPlay          = document.getElementById('player-play');
    const playerPlayIcon      = document.getElementById('player-play-icon');
    const playerCenterPlay    = document.getElementById('player-center-play');
    const playerCenterPlayIcon= document.getElementById('player-center-play-icon');
    const playerProgress      = document.getElementById('player-progress');
    const playerTime          = document.getElementById('player-time');
    const playerMute          = document.getElementById('player-mute');
    const playerVolume        = document.getElementById('player-volume');
    const playerSkipBack      = document.getElementById('player-skip-back');
    const playerSkipForward   = document.getElementById('player-skip-forward');
    const playerFullscreen    = document.getElementById('player-fullscreen');

    // Detail modal
    const detailModal         = document.getElementById('detail-modal');
    const detailClose         = document.getElementById('detail-close');
    const detailBackdrop      = document.getElementById('detail-modal-backdrop');
    const detailHero          = document.getElementById('detail-hero');
    const detailTitle         = document.getElementById('detail-title');
    const detailTagline       = document.getElementById('detail-tagline');
    const detailDesc          = document.getElementById('detail-desc');
    const detailMetaBar       = document.getElementById('detail-meta-bar');
    const detailRating        = document.getElementById('detail-rating');
    const detailYear          = document.getElementById('detail-year');
    const detailRuntime       = document.getElementById('detail-runtime');
    const detailGenres        = document.getElementById('detail-genres');
    const detailPlay          = document.getElementById('detail-play');
    const detailAddList       = document.getElementById('detail-add-list');
    const detailListIconAdd   = document.getElementById('detail-list-icon-add');
    const detailListIconCheck = document.getElementById('detail-list-icon-check');
    const detailTrailerBtn    = document.getElementById('detail-trailer-btn');
    const detailTrailerWrap   = document.getElementById('detail-trailer-wrap');
    const detailTrailerIframe = document.getElementById('detail-trailer-iframe');
    const detailCastSection   = document.getElementById('detail-cast-section');
    const detailCastRow       = document.getElementById('detail-cast-row');
    const detailEpisodesSection = document.getElementById('detail-episodes-section');
    const detailSeasonSelect  = document.getElementById('detail-season-select');
    const detailEpSearch      = document.getElementById('detail-ep-search');
    const detailEpisodeList   = document.getElementById('detail-episode-list');
    const detailEpLoading     = document.getElementById('detail-ep-loading');
    const detailRelatedSection = document.getElementById('detail-related-section');
    const detailRelatedRow    = document.getElementById('detail-related-row');

    // Search
    const searchToggle        = document.getElementById('search-toggle');
    const searchOverlay       = document.getElementById('search-overlay');
    const searchClose         = document.getElementById('search-close');
    const searchInput         = document.getElementById('search-input');
    const searchResultsGrid   = document.getElementById('search-results-grid');
    const searchLoading       = document.getElementById('search-loading');
    const searchPlaceholder   = document.getElementById('search-placeholder');

    // Nav links
    const navLinks = document.querySelectorAll('.nav-links a[data-page]');

    // ─── State ───────────────────────────────────────────────────────────────
    let currentPage       = 'home';
    let heroMovies        = [];
    let heroIndex         = 0;
    let heroRotateTimer   = null;
    let controlsHideTimer = null;
    let searchDebounce    = null;
    let searchRequestId   = 0;
    let detailRequestId   = 0;
    let playerRequestId   = 0;
    let currentDetailMovie = null;
    let currentDetailData  = null;  // full TMDB detail object
    let currentEpisodes    = [];    // episode list for current season
    let trailerVisible     = false;
    let currentPlayerMovie    = null;
    let currentPlayerSeason   = null;
    let currentPlayerEpisode  = null;
    let vixHlsInstance        = null;
    let activePlayerServer   = 'vixsrc';
    let playerReady          = false;
    let playerAudioTracks    = [];
    let playerSubtitleTracks = [];
    let playerAudioInitialized = false;

    // ─── My List (localStorage) ──────────────────────────────────────────────
    function getMyList() {
        try {
            const list = JSON.parse(localStorage.getItem('gsflix_mylist') || '[]');
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }
    function saveMyList(list) {
        localStorage.setItem('gsflix_mylist', JSON.stringify(list));
    }
    function isInMyList(id) {
        return getMyList().some(m => m.id === id);
    }
    function toggleMyList(movie) {
        let list = getMyList();
        const idx = list.findIndex(m => m.id === movie.id);
        if (idx === -1) { list.unshift(movie); }
        else { list.splice(idx, 1); }
        saveMyList(list);
        return idx === -1;
    }

    // ─── Navbar Scroll ───────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ─── Nav Tab Switching ───────────────────────────────────────────────────
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    function setActiveNav(page) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === page));
    }

    function switchPage(page) {
        if (page === currentPage && page !== 'mylist') return;
        currentPage = page;
        setActiveNav(page);
        stopHeroRotation();
        mylistEmpty.style.display = 'none';
        carouselsContainer.style.display = '';

        if (page === 'mylist') {
            loadMyListPage();
        } else {
            const endpoint = {
                home:    '/api/home',
                movies:  '/api/movies',
                tvshows: '/api/tvshows',
                popular: '/api/popular',
            }[page] || '/api/home';

            showLoadingSkeleton();
            fetchAndRender(endpoint, page);
        }
    }

    function fetchAndRender(endpoint, page) {
        fetch(endpoint)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(movies => {
                carouselsContainer.innerHTML = '';
                if (!movies || movies.length === 0) {
                    showError('No content found. Check your TMDB API key.');
                    heroTitle.textContent = 'Nothing here yet';
                    heroDesc.textContent  = 'Content could not be loaded.';
                    return;
                }
                heroMovies = movies.filter(m => m.banner).slice(0, 8);
                heroIndex  = 0;
                renderHeroMovies(heroMovies);
                startHeroRotation();

                const categories = {};
                if (page === 'home') {
                    const cw = getContinueWatching();
                    if (cw && cw.length > 0) {
                        renderRow('Continue Watching', cw, true);
                    }
                }
                movies.forEach(movie => {
                    (movie.categories || []).forEach(cat => {
                        if (!categories[cat]) categories[cat] = [];
                        categories[cat].push(movie);
                    });
                });
                Object.keys(categories).forEach(cat => renderRow(cat, categories[cat]));
            })
            .catch(err => {
                console.error('Error fetching content:', err);
                carouselsContainer.innerHTML = '';
                showError('Failed to connect to the server. Make sure the server is running.');
                heroTitle.textContent = 'Connection Error';
                heroDesc.textContent  = 'Could not reach the movie server.';
            });
    }

    // ─── My List Page ────────────────────────────────────────────────────────
    function loadMyListPage() {
        carouselsContainer.innerHTML = '';
        stopHeroRotation();
        const list = getMyList();
        if (list.length === 0) {
            mylistEmpty.style.display = 'flex';
            heroTitle.textContent = 'My List';
            heroDesc.textContent  = '';
            hero.style.backgroundImage = '';
            heroMetaRow.innerHTML = '';
            heroDots.innerHTML = '';
        } else {
            mylistEmpty.style.display = 'none';
            heroMovies = list.filter(m => m.banner).slice(0, 6);
            heroIndex  = 0;
            renderHeroMovies(heroMovies);
            if (heroMovies.length > 1) startHeroRotation();
            renderRow('My List', list);
        }
    }

    mylistBrowseBtn.addEventListener('click', () => switchPage('home'));

    // ─── Hero ────────────────────────────────────────────────────────────────
    function renderHeroMovies(movies) {
        if (!movies || movies.length === 0) return;
        setHero(movies[0]);
        buildHeroDots(movies.length, 0);
    }

    function setHero(movie) {
        if (movie.banner) {
            hero.style.backgroundImage = `url('${movie.banner}')`;
        }
        heroTitle.textContent = movie.title;
        heroDesc.textContent  = movie.description || '';

        // Build meta row
        heroMetaRow.innerHTML = '';
        
        if (movie.rating) {
            const ratingEl = document.createElement('span');
            ratingEl.className = 'hero-meta-rating';
            ratingEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#f5c518" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${movie.rating.toFixed(1)}`;
            heroMetaRow.appendChild(ratingEl);
        }

        if (movie.year) {
            if (movie.rating) {
                const sep = document.createElement('span');
                sep.className = 'hero-meta-dot';
                heroMetaRow.appendChild(sep);
            }
            const yearEl = document.createElement('span');
            yearEl.className = 'hero-meta-year';
            yearEl.textContent = movie.year;
            heroMetaRow.appendChild(yearEl);
        }

        if (movie.genres && movie.genres.length > 0) {
            if (movie.rating || movie.year) {
                const sep = document.createElement('span');
                sep.className = 'hero-meta-dot';
                heroMetaRow.appendChild(sep);
            }
            movie.genres.slice(0, 3).forEach(g => {
                const pill = document.createElement('span');
                pill.className = 'hero-genre-pill';
                pill.textContent = g;
                heroMetaRow.appendChild(pill);
            });
        }

        heroPlay.onclick = () => openPlayer(movie);
        heroInfo.onclick = () => openDetailModal(movie);

        // Banner click area → open detail modal
        heroClickArea.onclick = () => openDetailModal(movie);
        heroClickArea.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDetailModal(movie);
            }
        };

        heroAddList.onclick = () => {
            const added = toggleMyList(movie);
            heroAddList.classList.toggle('in-list', added);
            heroAddList.querySelector('svg').style.transform = added ? 'rotate(45deg)' : '';
        };
        const inList = isInMyList(movie.id);
        heroAddList.classList.toggle('in-list', inList);
    }

    function buildHeroDots(count, active) {
        heroDots.innerHTML = '';
        if (count <= 1) return;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'hero-dot' + (i === active ? ' active' : '');
            dot.setAttribute('aria-label', `Show hero ${i + 1}`);
            dot.addEventListener('click', e => {
                e.stopPropagation(); // don't fire hero click area
                heroIndex = i;
                clearInterval(heroRotateTimer);
                setHero(heroMovies[heroIndex]);
                buildHeroDots(heroMovies.length, heroIndex);
                startHeroRotation();
            });
            heroDots.appendChild(dot);
        }
    }

    function startHeroRotation() {
        stopHeroRotation();
        if (heroMovies.length <= 1) return;
        heroRotateTimer = setInterval(() => {
            heroIndex = (heroIndex + 1) % heroMovies.length;
            setHero(heroMovies[heroIndex]);
            buildHeroDots(heroMovies.length, heroIndex);
        }, 8000);
    }

    function stopHeroRotation() {
        if (heroRotateTimer) { clearInterval(heroRotateTimer); heroRotateTimer = null; }
    }

    // ─── Row Rendering ────────────────────────────────────────────────────────
    function renderRow(title, movies, isContinueWatching = false) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        const rowHeader = document.createElement('div');
        rowHeader.className = 'row-header';

        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        rowHeader.appendChild(titleEl);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'scroll-btns';

        const btnLeft = document.createElement('button');
        btnLeft.className = 'scroll-btn scroll-left';
        btnLeft.setAttribute('aria-label', 'Scroll left');
        btnLeft.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

        const btnRight = document.createElement('button');
        btnRight.className = 'scroll-btn scroll-right';
        btnRight.setAttribute('aria-label', 'Scroll right');
        btnRight.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

        btnGroup.appendChild(btnLeft);
        btnGroup.appendChild(btnRight);
        rowHeader.appendChild(btnGroup);
        rowDiv.appendChild(rowHeader);

        const postersDiv = document.createElement('div');
        postersDiv.className = 'row-posters';

        const scrollAmount = 700;
        btnLeft.addEventListener('click', () => postersDiv.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        btnRight.addEventListener('click', () => postersDiv.scrollBy({ left: scrollAmount, behavior: 'smooth' }));

        movies.forEach(movie => postersDiv.appendChild(createPosterCard(movie, false, isContinueWatching)));

        rowDiv.appendChild(postersDiv);
        carouselsContainer.appendChild(rowDiv);
    }

    function createPosterCard(movie, small = false, isContinueWatching = false) {
        const card = document.createElement('div');
        card.className = 'poster-card' + (small ? ' poster-card-sm' : '');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', isContinueWatching ? `Play ${movie.title}` : `View details for ${movie.title}`);

        const activateCard = () => {
            if (isContinueWatching) {
                openPlayer(movie);
            } else {
                openDetailModal(movie);
            }
        };
        card.addEventListener('click', activateCard);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateCard();
            }
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'poster-wrapper';

        const img = document.createElement('img');
        img.src = movie.thumbnail;
        img.className = 'poster';
        img.alt = movie.title;
        img.loading = 'lazy';
        img.onerror = () => { img.src = 'https://placehold.co/200x300/1a1a2e/ffffff?text=No+Image'; };

        const overlay = document.createElement('div');
        overlay.className = 'poster-overlay';

        const pTitle = document.createElement('div');
        pTitle.className = 'poster-title';
        pTitle.textContent = movie.title;

        overlay.appendChild(pTitle);
        wrapper.appendChild(img);
        wrapper.appendChild(overlay);

        if (isContinueWatching) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'poster-remove-btn';
            removeBtn.setAttribute('aria-label', 'Remove from Continue Watching');
            removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            removeBtn.addEventListener('click', e => {
                e.stopPropagation();
                removeFromContinueWatching(movie.id);
                card.remove();
            });
            wrapper.appendChild(removeBtn);
        }

        const metaBelow = document.createElement('div');
        metaBelow.className = 'poster-meta-below';

        const titleBelow = document.createElement('div');
        titleBelow.className = 'poster-meta-title';
        titleBelow.textContent = movie.title;

        const infoBelow = document.createElement('div');
        infoBelow.className = 'poster-meta-info';

        if (movie.year) {
            const yearEl = document.createElement('span');
            yearEl.textContent = movie.year;
            infoBelow.appendChild(yearEl);
        }

        if (movie.rating) {
            if (movie.year) {
                const dot = document.createElement('span');
                dot.textContent = '•';
                infoBelow.appendChild(dot);
            }
            const rateEl = document.createElement('span');
            rateEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#f5c518" stroke="none" style="margin-right:2px; vertical-align:-1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>${movie.rating.toFixed(1)}`;
            infoBelow.appendChild(rateEl);
        }

        metaBelow.appendChild(titleBelow);
        metaBelow.appendChild(infoBelow);

        card.appendChild(wrapper);
        card.appendChild(metaBelow);
        return card;
    }

    // ─── Loading Skeleton ─────────────────────────────────────────────────────
    function showLoadingSkeleton() {
        carouselsContainer.innerHTML = '';
        for (let r = 0; r < 3; r++) {
            const row = document.createElement('div');
            row.className = 'row skeleton-row';
            const label = document.createElement('div');
            label.className = 'skeleton skeleton-label';
            row.appendChild(label);
            const strip = document.createElement('div');
            strip.className = 'row-posters';
            for (let i = 0; i < 8; i++) {
                const card = document.createElement('div');
                card.className = 'poster-wrapper skeleton skeleton-card';
                strip.appendChild(card);
            }
            row.appendChild(strip);
            carouselsContainer.appendChild(row);
        }
    }

    // ─── Error Banner ─────────────────────────────────────────────────────────
    function showError(msg) {
        const err = document.createElement('div');
        err.className = 'error-banner';
        err.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>${msg}</span>`;
        carouselsContainer.appendChild(err);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ─── Detail Modal ────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    function openDetailModal(movie) {
        const requestId = ++detailRequestId;
        currentDetailMovie = movie;
        currentDetailData  = null;
        trailerVisible     = false;

        // Reset trailer
        detailTrailerWrap.style.display = 'none';
        detailTrailerIframe.src = '';
        detailHero.classList.remove('trailer-active');
        detailTrailerBtn.style.display = 'none';

        // Set backdrop image immediately
        if (movie.banner) {
            detailHero.style.backgroundImage = `url('${movie.banner}')`;
        } else {
            detailHero.style.backgroundImage = '';
        }

        // Basic fields
        detailTitle.textContent   = movie.title || '';
        detailTagline.textContent = '';
        detailDesc.textContent    = movie.description || 'No description available.';
        detailRating.innerHTML    = '';
        detailYear.textContent    = '';
        detailRuntime.textContent = '';
        detailGenres.innerHTML    = '';
        detailCastRow.innerHTML   = '';
        detailRelatedRow.innerHTML = '';
        detailCastSection.style.display   = 'none';
        detailRelatedSection.style.display = 'none';
        detailEpisodesSection.style.display = 'none';
        detailEpSearch.value = '';

        // My list state
        const inList = isInMyList(movie.id);
        detailListIconAdd.style.display   = inList ? 'none' : '';
        detailListIconCheck.style.display = inList ? '' : 'none';
        detailAddList.classList.toggle('in-list', inList);
        detailAddList.title = inList ? 'Remove from My List' : 'Add to My List';

        detailPlay.onclick = () => { closeDetailModal(); openPlayer(movie); };
        detailAddList.onclick = () => {
            const added = toggleMyList(movie);
            detailListIconAdd.style.display   = added ? 'none' : '';
            detailListIconCheck.style.display = added ? '' : 'none';
            detailAddList.classList.toggle('in-list', added);
            detailAddList.title = added ? 'Remove from My List' : 'Add to My List';
        };

        // Show modal
        detailModal.style.display = 'flex';
        detailModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => requestAnimationFrame(() => detailModal.classList.add('show')));

        // Fetch full detail
        fetchDetailData(movie, requestId);
    }

    function fetchDetailData(movie, requestId) {
        fetch(`/api/detail?type=${encodeURIComponent(movie.type)}&id=${encodeURIComponent(movie.id)}`)
            .then(r => {
                if (!r.ok) throw new Error('detail fetch failed');
                return r.json();
            })
            .then(data => {
                if (requestId !== detailRequestId || currentDetailMovie !== movie) return;
                currentDetailData = data;
                populateDetailModal(movie, data);
            })
            .catch(err => {
                console.warn('Could not load detail data:', err);
            });
    }

    function populateDetailModal(movie, d) {
        // Title
        const title = d.title || d.name || movie.title;
        detailTitle.textContent = title;

        // Tagline
        if (d.tagline) {
            detailTagline.textContent = `"${d.tagline}"`;
        }

        // Rating
        if (d.vote_average) {
            detailRating.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#f5c518" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ${d.vote_average.toFixed(1)}`;
        }

        // Year
        const dateStr = d.release_date || d.first_air_date || '';
        if (dateStr) {
            detailYear.textContent = dateStr.slice(0, 4);
        }

        // Runtime / Seasons
        if (movie.type === 'movie' && d.runtime) {
            const h = Math.floor(d.runtime / 60);
            const m = d.runtime % 60;
            detailRuntime.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
        } else if (movie.type === 'tv' && d.number_of_seasons) {
            detailRuntime.textContent = `${d.number_of_seasons} Season${d.number_of_seasons !== 1 ? 's' : ''}`;
        }

        // Genres
        detailGenres.innerHTML = '';
        if (d.genres && d.genres.length) {
            d.genres.slice(0, 4).forEach(g => {
                const pill = document.createElement('span');
                pill.className = 'detail-genre-pill';
                pill.textContent = g.name;
                detailGenres.appendChild(pill);
            });
        }

        // Overview
        if (d.overview) {
            detailDesc.textContent = d.overview;
        }

        // Trailer
        let trailerKey = null;
        if (d.videos && d.videos.results) {
            const trailers = d.videos.results.filter(v => v.site === 'YouTube' && v.type === 'Trailer');
            const official = trailers.find(v => v.official) || trailers[0];
            if (official) trailerKey = official.key;

            // Also try teasers if no trailer
            if (!trailerKey) {
                const teaser = d.videos.results.find(v => v.site === 'YouTube' && v.type === 'Teaser');
                if (teaser) trailerKey = teaser.key;
            }
        }

        if (trailerKey) {
            const key = trailerKey;
            detailTrailerBtn.style.display = '';
            detailTrailerBtn.onclick = () => toggleTrailer(key);
        }

        // Cast
        if (d.credits && d.credits.cast && d.credits.cast.length) {
            detailCastSection.style.display = '';
            detailCastRow.innerHTML = '';
            d.credits.cast.slice(0, 15).forEach(actor => {
                const card = document.createElement('div');
                card.className = 'cast-card';

                const avatarSrc = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : 'https://placehold.co/72x72/2a2a3a/ffffff?text=?';

                const img = document.createElement('img');
                img.src = avatarSrc;
                img.alt = actor.name;
                img.className = 'cast-avatar';
                img.onerror = () => { img.src = 'https://placehold.co/72x72/2a2a3a/ffffff?text=?'; };

                const name = document.createElement('div');
                name.className = 'cast-name';
                name.textContent = actor.name;

                const char = document.createElement('div');
                char.className = 'cast-char';
                char.textContent = actor.character || '';

                card.appendChild(img);
                card.appendChild(name);
                if (actor.character) card.appendChild(char);
                detailCastRow.appendChild(card);
            });
        }

        // TV Show Episodes section
        if (movie.type === 'tv' && d.seasons && d.seasons.length) {
            // Filter out season 0 (Specials) unless it's the only one
            const seasons = d.seasons.filter(s => s.season_number > 0);
            if (seasons.length === 0 && d.seasons.length > 0) {
                seasons.push(...d.seasons);
            }
            if (seasons.length) {
                detailEpisodesSection.style.display = '';
                buildSeasonSelector(movie, seasons);
            }
        }

        // Related content
        if (d.recommendations && d.recommendations.results && d.recommendations.results.length) {
            detailRelatedSection.style.display = '';
            detailRelatedRow.innerHTML = '';
            d.recommendations.results.slice(0, 20).forEach(rec => {
                if (!rec.poster_path) return;
                const recTitle = rec.title || rec.name || '';
                const recType  = rec.title ? 'movie' : 'tv';
                const recMovie = {
                    id:          String(rec.id),
                    title:       recTitle,
                    description: rec.overview || '',
                    banner:      rec.backdrop_path ? `https://image.tmdb.org/t/p/original${rec.backdrop_path}` : '',
                    thumbnail:   `https://image.tmdb.org/t/p/w500${rec.poster_path}`,
                    categories:  ['Related'],
                    type:        recType,
                };

                const card = document.createElement('div');
                card.className = 'related-card';
                card.title = recTitle;

                const img = document.createElement('img');
                img.src = recMovie.thumbnail;
                img.alt = recTitle;
                img.className = 'related-poster';
                img.loading = 'lazy';
                img.onerror = () => { img.src = 'https://placehold.co/150x225/1a1a2e/fff?text=No+Image'; };

                const lbl = document.createElement('div');
                lbl.className = 'related-title';
                lbl.textContent = recTitle;

                card.appendChild(img);
                card.appendChild(lbl);
                card.addEventListener('click', () => {
                    closeDetailModal();
                    setTimeout(() => openDetailModal(recMovie), 380);
                });
                detailRelatedRow.appendChild(card);
            });
        }
    }

    // ─── Season selector ─────────────────────────────────────────────────────
    function buildSeasonSelector(movie, seasons) {
        detailSeasonSelect.innerHTML = '';
        seasons.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.season_number;
            opt.textContent = s.name || `Season ${s.season_number}`;
            detailSeasonSelect.appendChild(opt);
        });

        detailSeasonSelect.onchange = () => {
            const seasonNum = parseInt(detailSeasonSelect.value);
            loadEpisodes(movie.id, seasonNum);
        };

        // Load first season
        loadEpisodes(movie.id, seasons[0].season_number);
    }

    function loadEpisodes(tvId, seasonNum) {
        detailEpLoading.style.display = 'flex';
        detailEpisodeList.innerHTML = '';
        detailEpisodeList.appendChild(detailEpLoading);
        detailEpSearch.value = '';
        currentEpisodes = [];

        fetch(`/api/episodes?id=${tvId}&season=${seasonNum}`)
            .then(r => {
                if (!r.ok) throw new Error('episodes fetch failed');
                return r.json();
            })
            .then(data => {
                currentEpisodes = (data.episodes || []).filter(ep => ep.episode_number > 0);
                renderEpisodeList(currentEpisodes, tvId);
            })
            .catch(() => {
                detailEpisodeList.innerHTML = '<div class="episode-no-results">Could not load episodes.</div>';
            });
    }

    function renderEpisodeList(episodes, tvId) {
        detailEpisodeList.innerHTML = '';
        if (!episodes || episodes.length === 0) {
            detailEpisodeList.innerHTML = '<div class="episode-no-results">No episodes found.</div>';
            return;
        }

        const seasonNum = parseInt(detailSeasonSelect.value) || 1;

        episodes.forEach(ep => {
            const item = document.createElement('div');
            item.className = 'episode-list-item';
            item.title = `Play ${ep.name}`;

            const numBadge = document.createElement('div');
            numBadge.className = 'episode-num-badge';
            numBadge.textContent = ep.episode_number;

            const stillWrap = document.createElement('div');
            stillWrap.className = 'episode-still-wrap';

            const still = document.createElement('img');
            still.className = 'episode-still';
            still.alt = ep.name;
            still.loading = 'lazy';
            still.src = ep.still_path
                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                : 'https://placehold.co/300x169/1a1a2e/fff?text=No+Image';
            still.onerror = () => { still.src = 'https://placehold.co/300x169/1a1a2e/fff?text=No+Image'; };

            const stillPlay = document.createElement('div');
            stillPlay.className = 'episode-still-play';
            stillPlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;

            stillWrap.appendChild(still);
            stillWrap.appendChild(stillPlay);

            const info = document.createElement('div');
            info.className = 'episode-info';

            const titleRow = document.createElement('div');
            titleRow.className = 'episode-title-row';

            const titleEl = document.createElement('div');
            titleEl.className = 'episode-title';
            titleEl.textContent = ep.name || `Episode ${ep.episode_number}`;

            const runtimeEl = document.createElement('div');
            runtimeEl.className = 'episode-runtime';
            if (ep.runtime) {
                runtimeEl.textContent = ep.runtime >= 60
                    ? `${Math.floor(ep.runtime/60)}h ${ep.runtime%60}m`
                    : `${ep.runtime}m`;
            }

            titleRow.appendChild(titleEl);
            if (ep.runtime) titleRow.appendChild(runtimeEl);

            const desc = document.createElement('div');
            desc.className = 'episode-desc';
            desc.textContent = ep.overview || '';

            info.appendChild(titleRow);
            if (ep.overview) info.appendChild(desc);

            // Download button (decorative)
            const dlBtn = document.createElement('button');
            dlBtn.className = 'episode-dl-btn';
            dlBtn.setAttribute('aria-label', 'Download');
            dlBtn.title = 'Download';
            dlBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
            dlBtn.addEventListener('click', e => e.stopPropagation());

            item.appendChild(numBadge);
            item.appendChild(stillWrap);
            item.appendChild(info);
            item.appendChild(dlBtn);

            // Play episode on click
            item.addEventListener('click', () => {
                if (!currentDetailMovie) return;
                closeDetailModal();
                setTimeout(() => launchPlayer(currentDetailMovie, seasonNum, ep.episode_number), 380);
            });

            detailEpisodeList.appendChild(item);
        });
    }

    // Episode search filter
    detailEpSearch.addEventListener('input', () => {
        const q = detailEpSearch.value.toLowerCase().trim();
        if (!q) {
            renderEpisodeList(currentEpisodes, currentDetailMovie?.id);
            return;
        }
        const filtered = currentEpisodes.filter(ep =>
            (ep.name || '').toLowerCase().includes(q) ||
            (ep.overview || '').toLowerCase().includes(q)
        );
        renderEpisodeList(filtered, currentDetailMovie?.id);
    });

    // ─── Trailer toggle ───────────────────────────────────────────────────────
    function toggleTrailer(key) {
        trailerVisible = !trailerVisible;
        if (trailerVisible) {
            detailTrailerIframe.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`;
            detailTrailerWrap.style.display = '';
            detailHero.classList.add('trailer-active');
            detailTrailerBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                Close Trailer`;
        } else {
            detailTrailerIframe.src = '';
            detailTrailerWrap.style.display = 'none';
            detailHero.classList.remove('trailer-active');
            detailTrailerBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                Trailer`;
        }
    }

    // ─── Close detail modal ───────────────────────────────────────────────────
    function closeDetailModal() {
        detailRequestId++;
        detailModal.classList.remove('show');
        detailModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // Stop trailer
        detailTrailerIframe.src = '';
        detailTrailerWrap.style.display = 'none';
        detailHero.classList.remove('trailer-active');
        trailerVisible = false;
        setTimeout(() => { detailModal.style.display = 'none'; }, 350);
    }

    detailClose.addEventListener('click', closeDetailModal);
    detailBackdrop.addEventListener('click', closeDetailModal);

    // ─── Search ──────────────────────────────────────────────────────────────
    searchToggle.addEventListener('click', openSearch);

    function openSearch() {
        searchOverlay.classList.add('show');
        searchOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput.focus(), 100);
    }

    function closeSearch() {
        searchRequestId++;
        searchOverlay.classList.remove('show');
        searchOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResultsGrid.innerHTML = '';
        searchPlaceholder.style.display = '';
        searchLoading.style.display = 'none';
    }

    searchClose.addEventListener('click', closeSearch);

    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        const requestId = ++searchRequestId;
        const q = searchInput.value.trim();
        if (!q) {
            searchResultsGrid.innerHTML = '';
            searchPlaceholder.style.display = '';
            searchLoading.style.display = 'none';
            return;
        }
        searchPlaceholder.style.display = 'none';
        searchLoading.style.display = 'flex';
        searchResultsGrid.innerHTML = '';
        searchDebounce = setTimeout(() => doSearch(q, requestId), 400);
    });

    function doSearch(q, requestId) {
        fetch(`/api/search?q=${encodeURIComponent(q)}`)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(results => {
                if (requestId !== searchRequestId) return;
                searchLoading.style.display = 'none';
                searchResultsGrid.innerHTML = '';
                if (!results || results.length === 0) {
                    searchResultsGrid.innerHTML = `<div class="search-no-results"><p>No results for "<strong>${escapeHtml(q)}</strong>"</p></div>`;
                    return;
                }
                results.forEach(movie => {
                    const card = createPosterCard(movie, true);
                    card.addEventListener('click', () => closeSearch());
                    searchResultsGrid.appendChild(card);
                });
            })
            .catch(() => {
                if (requestId !== searchRequestId) return;
                searchLoading.style.display = 'none';
                searchResultsGrid.innerHTML = `<div class="search-no-results"><p>Search failed. Please try again.</p></div>`;
            });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // ─── Progress Tracking (localStorage) ────────────────────────────────────
    function getProgress(id) {
        try { 
            const prog = JSON.parse(localStorage.getItem('gsflix_progress') || '{}'); 
            return prog[id] || { season: 1, episode: 1 };
        }
        catch { return { season: 1, episode: 1 }; }
    }
    function saveProgress(id, season, episode) {
        try {
            const prog = JSON.parse(localStorage.getItem('gsflix_progress') || '{}');
            prog[id] = { season, episode };
            localStorage.setItem('gsflix_progress', JSON.stringify(prog));
        } catch (e) { console.warn('Could not save playback progress:', e); }
    }

    function addToContinueWatching(movie) {
        try {
            let cw = JSON.parse(localStorage.getItem('gsflix_cw') || '[]');
            cw = cw.filter(m => m.id !== movie.id);
            const clone = Object.assign({}, movie);
            delete clone.description;
            delete clone.banner;
            cw.unshift(clone);
            if (cw.length > 20) cw.pop();
            localStorage.setItem('gsflix_cw', JSON.stringify(cw));
        } catch (e) { console.warn('Could not save continue-watching state:', e); }
    }

    function getContinueWatching() {
        try {
            const list = JSON.parse(localStorage.getItem('gsflix_cw') || '[]');
            return Array.isArray(list) ? list : [];
        } catch (e) {
            console.warn('Could not read continue-watching state:', e);
            return [];
        }
    }

    function removeFromContinueWatching(id) {
        try {
            let cw = JSON.parse(localStorage.getItem('gsflix_cw') || '[]');
            cw = cw.filter(m => m.id !== id);
            localStorage.setItem('gsflix_cw', JSON.stringify(cw));
        } catch (e) { console.warn('Could not update continue-watching state:', e); }
    }

    // ─── Player ───────────────────────────────────────────────────────────────
    function openPlayer(movie) {
        if (movie.type === 'tv') {
            const prog = getProgress(movie.id);
            launchPlayer(movie, prog.season, prog.episode);
        } else {
            launchPlayer(movie);
        }
    }

    function normalizeTrackLabel(track, fallback, index) {
        const attrs = track?.attrs || {};
        return track?.name || track?.lang || attrs.NAME || attrs.LANGUAGE || fallback || `Track ${index + 1}`;
    }

    function isEnglishTrack(track) {
        const attrs = track?.attrs || {};
        const value = String(track?.lang || attrs.LANGUAGE || track?.name || attrs.NAME || '').toLowerCase();
        return /(^|[-_])en(g|us|gb|ca|au)?([_-]|$)/i.test(value) || /english/.test(value);
    }

    function isDefaultTrack(track) {
        const attrs = track?.attrs || {};
        return track?.default === true || track?.default === 'YES' || attrs.DEFAULT === 'YES' || track?.autoselect === true || attrs.AUTOSELECT === 'YES';
    }

    function chooseDefaultAudioIndex(tracks) {
        if (!tracks.length) return -1;
        const english = tracks.findIndex(isEnglishTrack);
        if (english >= 0) return english;
        const preferred = tracks.findIndex(isDefaultTrack);
        return preferred >= 0 ? preferred : 0;
    }

    function renderTrackMenu(menu, tracks, currentIndex, type) {
        if (!menu) return;
        menu.innerHTML = '';
        if (type === 'subtitle' && tracks.length) {
            const off = document.createElement('button');
            off.type = 'button';
            off.role = 'option';
            off.dataset.trackIndex = '-1';
            off.setAttribute('aria-selected', currentIndex < 0 ? 'true' : 'false');
            off.innerHTML = '<span><strong>Off</strong></span><svg class="track-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            off.addEventListener('click', () => selectPlayerTrack(type, -1));
            menu.appendChild(off);
        }
        if (!tracks.length) {
            const empty = document.createElement('div');
            empty.className = 'player-track-empty';
            empty.textContent = type === 'audio' ? 'No alternate audio' : 'No subtitles available';
            menu.appendChild(empty);
            return;
        }
        tracks.forEach((track, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.role = 'option';
            button.dataset.trackIndex = String(index);
            button.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
            button.innerHTML = `<span><strong>${escapeHtml(normalizeTrackLabel(track, type === 'audio' ? 'Original' : 'Subtitles', index))}</strong></span><svg class="track-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            button.addEventListener('click', () => selectPlayerTrack(type, index));
            menu.appendChild(button);
        });
    }

    function syncPlayerAudioMenu(index) {
        if (!playerAudioCurrent) return;
        const track = playerAudioTracks[index];
        playerAudioCurrent.textContent = track ? normalizeTrackLabel(track, isEnglishTrack(track) ? 'English' : 'Original', index) : 'Original';
        playerAudioMenu?.querySelectorAll('[data-track-index]').forEach(button => {
            button.setAttribute('aria-selected', Number(button.dataset.trackIndex) === index ? 'true' : 'false');
        });
    }

    function syncPlayerSubtitleMenu(index) {
        if (!playerSubtitleCurrent) return;
        playerSubtitleCurrent.textContent = index >= 0 && playerSubtitleTracks[index]
            ? normalizeTrackLabel(playerSubtitleTracks[index], 'Subtitles', index)
            : 'Off';
        playerSubtitleMenu?.querySelectorAll('[data-track-index]').forEach(button => {
            button.setAttribute('aria-selected', Number(button.dataset.trackIndex) === index ? 'true' : 'false');
        });
    }

    function updatePlayerTrackMenus() {
        const audioIndex = vixHlsInstance ? vixHlsInstance.audioTrack : -1;
        const subtitleIndex = vixHlsInstance ? vixHlsInstance.subtitleTrack : -1;
        renderTrackMenu(playerAudioMenu, playerAudioTracks, audioIndex, 'audio');
        renderTrackMenu(playerSubtitleMenu, playerSubtitleTracks, subtitleIndex, 'subtitle');
        syncPlayerAudioMenu(audioIndex);
        syncPlayerSubtitleMenu(subtitleIndex);
        const hasAudioChoices = playerAudioTracks.length > 1;
        const hasSubtitleChoices = playerSubtitleTracks.length > 0;
        if (playerAudioPicker) playerAudioPicker.style.display = hasAudioChoices ? '' : 'none';
        if (playerSubtitlePicker) playerSubtitlePicker.style.display = hasSubtitleChoices ? '' : 'none';
    }

    function selectPlayerTrack(type, index) {
        if (type === 'audio' && vixHlsInstance && playerAudioTracks[index]) {
            vixHlsInstance.audioTrack = index;
            playerAudioInitialized = true;
            syncPlayerAudioMenu(index);
        } else if (type === 'subtitle' && vixHlsInstance) {
            vixHlsInstance.subtitleTrack = index;
            syncPlayerSubtitleMenu(index);
        }
        playerAudioPicker?.classList.remove('open');
        playerSubtitlePicker?.classList.remove('open');
        playerAudioTrigger?.setAttribute('aria-expanded', 'false');
        playerSubtitleTrigger?.setAttribute('aria-expanded', 'false');
    }

    function resetPlayerTracks() {
        playerAudioTracks = [];
        playerSubtitleTracks = [];
        playerAudioInitialized = false;
        if (playerAudioMenu) playerAudioMenu.innerHTML = '';
        if (playerSubtitleMenu) playerSubtitleMenu.innerHTML = '';
        if (playerAudioCurrent) playerAudioCurrent.textContent = 'Original';
        if (playerSubtitleCurrent) playerSubtitleCurrent.textContent = 'Off';
        if (playerAudioPicker) playerAudioPicker.style.display = 'none';
        if (playerSubtitlePicker) playerSubtitlePicker.style.display = 'none';
    }

    async function launchPlayer(movie, season, episode) {
        const requestId = ++playerRequestId;
        currentPlayerMovie = movie;
        currentPlayerSeason = season || 1;
        currentPlayerEpisode = episode || 1;

        if (movie.type === 'tv') {
            playerNextEp.style.display = 'flex';
            playerEpListBtn.style.display = 'flex';
        } else {
            playerNextEp.style.display = 'none';
            playerEpListBtn.style.display = 'none';
        }

        addToContinueWatching(movie);
        if (movie.type === 'tv') {
            saveProgress(movie.id, currentPlayerSeason, currentPlayerEpisode);
        }

        const server = playerServerSelect ? playerServerSelect.value : 'vixsrc';
        activePlayerServer = server;
        playerReady = false;
        playerMovieTitle.textContent = movie.type === 'tv'
            ? `${movie.title} — S${String(currentPlayerSeason).padStart(2,'0')}E${String(currentPlayerEpisode).padStart(2,'0')}`
            : movie.title || '';

        playerLoader.innerHTML = '<div class="player-spinner"></div>';
        playerLoader.style.display = 'flex';
        playerModal.style.display = 'flex';
        playerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            playerModal.classList.add('show');
            showControls();
        }));

        stopVixPlayback();
        resetPlayerTracks();
        resetPlayerUI(server);
        vixPlayer.style.display = 'none';
        vidkingPlayer.style.display = 'none';
        vidkingPlayer.src = '';

        try {
            if (server === 'vidking') {
                vidkingPlayer.style.display = 'block';
                vidkingPlayer.onload = () => {
                    if (requestId !== playerRequestId) return;
                    playerReady = true;
                    playerLoader.style.display = 'none';
                    showControls();
                };
                vidkingPlayer.onerror = () => {
                    if (requestId !== playerRequestId) return;
                    showPlayerError('VidKing could not load this video. Try VixSrc.');
                };
                if (movie.type === 'tv') {
                    vidkingPlayer.src = `https://www.vidking.net/embed/tv/${movie.id}/${currentPlayerSeason}/${currentPlayerEpisode}?color=e50914&autoPlay=true`;
                } else {
                    vidkingPlayer.src = `https://www.vidking.net/embed/movie/${movie.id}?color=e50914&autoPlay=true`;
                }
                return;
            }

            // VixSrc: resolve the current HLS source through the Go backend,
            // then load it directly into the project's existing player surface.
            vixPlayer.style.display = 'block';
            const endpoint = movie.type === 'tv'
                ? `/api/media/source/tv/${encodeURIComponent(movie.id)}/${encodeURIComponent(currentPlayerSeason)}/${encodeURIComponent(currentPlayerEpisode)}`
                : `/api/media/source/movie/${encodeURIComponent(movie.id)}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin'
            });

            let data;
            try {
                data = await response.json();
            } catch (_) {
                throw new Error(`Resolver returned an invalid response (${response.status})`);
            }

            if (requestId !== playerRequestId) return;
            if (!response.ok || !data.success || !data.url || data.type !== 'hls') {
                throw new Error(data.error || 'Unable to resolve media source');
            }

            await loadVixSource(data.url, requestId);
        } catch (error) {
            if (requestId !== playerRequestId) return;
            console.error('[Player] Source resolution failed:', error);
            showPlayerError(error.message || 'Unable to load this media.');
        }
    }

    function stopVixPlayback() {
        if (vixHlsInstance) {
            vixHlsInstance.destroy();
            vixHlsInstance = null;
        }
        vixPlayer.pause();
        vixPlayer.removeAttribute('src');
        vixPlayer.load();
        vixPlayer.onloadedmetadata = null;
        vixPlayer.onerror = null;
    }

    function loadVixSource(url, requestId) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            const finishReady = () => {
                if (resolved) return;
                if (requestId !== playerRequestId) {
                    resolved = true;
                    resolve();
                    return;
                }
                playerReady = true;
                playerLoader.style.display = 'none';
                updatePlayerPlayIcon();
                showControls();
                // Start playback when the source is actually ready. If autoplay is
                // blocked by the browser, the normal play button remains available.
                vixPlayer.play().catch(() => {});
                resolved = true;
                resolve();
            };

            vixPlayer.onerror = () => reject(new Error('The resolved HLS source could not be loaded by the browser'));

            if (window.Hls && Hls.isSupported()) {
                vixHlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    // Do not limit the selected quality to the video element size.
                    capLevelToPlayerSize: false,
                    xhrSetup: function(xhr) {
                        xhr.withCredentials = false;
                    }
                });

                vixHlsInstance.loadSource(url);
                vixHlsInstance.attachMedia(vixPlayer);

                vixHlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                    // Select the highest available video rendition instead of letting
                    // ABR start at a lower quality because of the initial bandwidth estimate.
                    // Prefer resolution first, then bitrate as a tie-breaker.
                    const levels = vixHlsInstance.levels || [];
                    let bestLevel = -1;

                    for (let i = 0; i < levels.length; i++) {
                        const current = levels[i] || {};
                        const best = bestLevel >= 0 ? levels[bestLevel] : null;

                        if (!best ||
                            (current.height || 0) > (best.height || 0) ||
                            ((current.height || 0) === (best.height || 0) &&
                             (current.width || 0) > (best.width || 0)) ||
                            ((current.height || 0) === (best.height || 0) &&
                             (current.width || 0) === (best.width || 0) &&
                             (current.bitrate || 0) > (best.bitrate || 0))) {
                            bestLevel = i;
                        }
                    }

                    if (bestLevel >= 0) {
                        // Keep the audio rendition enabled while forcing the highest
                        // video rendition. Some HLS masters expose audio as a separate
                        // rendition group; forcing the video level must not disable it.
                        vixHlsInstance.autoLevelEnabled = false;
                        vixHlsInstance.currentLevel = bestLevel;

                        playerAudioTracks = vixHlsInstance.audioTracks || [];
                        playerSubtitleTracks = vixHlsInstance.subtitleTracks || [];
                        if (playerAudioTracks.length > 0 && !playerAudioInitialized) {
                            vixHlsInstance.audioTrack = chooseDefaultAudioIndex(playerAudioTracks);
                            playerAudioInitialized = true;
                        }
                        // Subtitles are intentionally off by default. The user can enable
                        // any available track from the Subtitles menu.
                        vixHlsInstance.subtitleTrack = -1;
                        updatePlayerTrackMenus();

                        vixPlayer.muted = false;

                        const selected = levels[bestLevel];
                        console.info('[Player] Highest video quality selected; audio retained:', {
                            level: bestLevel,
                            width: selected.width,
                            height: selected.height,
                            bitrate: selected.bitrate,
                            audioTrack: vixHlsInstance.audioTrack,
                            audioTracks: audioTracks.length
                        });
                    }

                    // MANIFEST_PARSED only means the playlist is known; the video
                    // frame may still be unavailable. Wait for media readiness below.
                });
                vixPlayer.addEventListener('canplay', finishReady, { once: true });
                vixPlayer.addEventListener('loadeddata', finishReady, { once: true });
                vixHlsInstance.on(Hls.Events.AUDIO_TRACKS_UPDATED, function() {
                    if (requestId !== playerRequestId) return;
                    playerAudioTracks = vixHlsInstance.audioTracks || [];
                    if (playerAudioTracks.length > 0 && !playerAudioInitialized) {
                        vixHlsInstance.audioTrack = chooseDefaultAudioIndex(playerAudioTracks);
                        playerAudioInitialized = true;
                    }
                    updatePlayerTrackMenus();
                    vixPlayer.muted = false;
                });

                vixHlsInstance.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function() {
                    if (requestId !== playerRequestId) return;
                    playerSubtitleTracks = vixHlsInstance.subtitleTracks || [];
                    vixHlsInstance.subtitleTrack = -1;
                    updatePlayerTrackMenus();
                });

                vixHlsInstance.on(Hls.Events.AUDIO_TRACK_SWITCHED, function() {
                    if (requestId !== playerRequestId) return;
                    syncPlayerAudioMenu(vixHlsInstance.audioTrack);
                });

                vixHlsInstance.on(Hls.Events.SUBTITLE_TRACK_SWITCH, function() {
                    if (requestId !== playerRequestId) return;
                    syncPlayerSubtitleMenu(vixHlsInstance.subtitleTrack);
                });

                vixHlsInstance.on(Hls.Events.ERROR, function(event, data) {
                    if (requestId !== playerRequestId) return;
                    console.error('[Player] HLS error:', data.type, data.details, data.error || '');
                    if (data.fatal) {
                        // A forced top rendition can occasionally be incompatible with
                        // a browser/device. Fall back to HLS ABR once before failing.
                        if (vixHlsInstance && !vixHlsInstance.__gsflixRecovered) {
                            vixHlsInstance.__gsflixRecovered = true;
                            vixHlsInstance.startLevel = -1;
                            vixHlsInstance.currentLevel = -1;
                            vixHlsInstance.autoLevelEnabled = true;
                            return;
                        }
                        reject(new Error('HLS playback failed'));
                    }
                });
                return;
            }

            if (vixPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                vixPlayer.src = url;
                vixPlayer.addEventListener('loadedmetadata', finishReady, { once: true });
                return;
            }

            reject(new Error('This browser does not support HLS playback'));
        });
    }

    // Episode panel logic
    playerNextEp.addEventListener('click', () => {
        launchPlayer(currentPlayerMovie, currentPlayerSeason, currentPlayerEpisode + 1);
    });

    playerEpListBtn.addEventListener('click', () => {
        playerEpPanel.classList.add('show');
        loadPlayerEpisodesPanel();
    });

    function syncServerPicker() {
        if (!playerServerSelect) return;
        const value = playerServerSelect.value || 'vixsrc';
        const option = playerServerSelect.options[playerServerSelect.selectedIndex];
        if (playerServerCurrent) playerServerCurrent.textContent = option ? option.textContent : value;
        playerServerMenu?.querySelectorAll('[data-server]').forEach(btn => {
            const selected = btn.dataset.server === value;
            btn.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
    }

    if (playerServerSelect) {
        playerServerSelect.addEventListener('change', () => {
            syncServerPicker();
            playerServerPicker?.classList.remove('open');
            playerServerTrigger?.setAttribute('aria-expanded', 'false');
            if (currentPlayerMovie) launchPlayer(currentPlayerMovie, currentPlayerSeason, currentPlayerEpisode);
        });
    }
    function toggleTrackPicker(picker, trigger) {
        const open = picker.classList.toggle('open');
        if (open) {
            playerServerPicker?.classList.remove('open');
            playerServerTrigger?.setAttribute('aria-expanded', 'false');
            playerAudioPicker !== picker && playerAudioPicker?.classList.remove('open');
            playerSubtitlePicker !== picker && playerSubtitlePicker?.classList.remove('open');
        }
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    playerAudioTrigger?.addEventListener('click', e => {
        e.stopPropagation();
        toggleTrackPicker(playerAudioPicker, playerAudioTrigger);
    });
    playerSubtitleTrigger?.addEventListener('click', e => {
        e.stopPropagation();
        toggleTrackPicker(playerSubtitlePicker, playerSubtitleTrigger);
    });

    playerServerTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = playerServerPicker.classList.toggle('open');
        playerServerTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    playerServerMenu?.querySelectorAll('[data-server]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!playerServerSelect) return;
            playerServerSelect.value = btn.dataset.server;
            playerServerSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    playerSeasonTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = playerSeasonPicker.classList.toggle('open');
        playerSeasonTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', () => {
        playerServerPicker?.classList.remove('open');
        playerServerTrigger?.setAttribute('aria-expanded', 'false');
        playerAudioPicker?.classList.remove('open');
        playerAudioTrigger?.setAttribute('aria-expanded', 'false');
        playerSubtitlePicker?.classList.remove('open');
        playerSubtitleTrigger?.setAttribute('aria-expanded', 'false');
        playerSeasonPicker?.classList.remove('open');
        playerSeasonTrigger?.setAttribute('aria-expanded', 'false');
    });

    syncServerPicker();

    playerEpPanelClose.addEventListener('click', () => {
        playerEpPanel.classList.remove('show');
    });

    function loadPlayerEpisodesPanel() {
        playerEpSeasonSelect.innerHTML = '';
        if (playerSeasonMenu) playerSeasonMenu.innerHTML = '';
        playerEpLoading.style.display = 'flex';
        playerEpList.innerHTML = '';
        playerEpList.appendChild(playerEpLoading);

        fetch(`/api/detail?id=${currentPlayerMovie.id}&type=tv`)
            .then(r => r.json())
            .then(data => {
                if (!data || !data.seasons) throw new Error('No seasons');
                const seasons = data.seasons.filter(s => s.season_number > 0);
                seasons.forEach(s => {
                    const label = s.name || `Season ${s.season_number}`;
                    const opt = document.createElement('option');
                    opt.value = s.season_number;
                    opt.textContent = label;
                    if (s.season_number === currentPlayerSeason) opt.selected = true;
                    playerEpSeasonSelect.appendChild(opt);

                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.dataset.season = s.season_number;
                    btn.textContent = label;
                    if (s.season_number === currentPlayerSeason) btn.classList.add('active');
                    btn.addEventListener('click', () => {
                        playerEpSeasonSelect.value = String(s.season_number);
                        playerSeasonCurrent.textContent = label;
                        playerSeasonMenu.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
                        playerSeasonPicker.classList.remove('open');
                        playerSeasonTrigger.setAttribute('aria-expanded', 'false');
                        fetchPlayerEpisodes(s.season_number);
                    });
                    playerSeasonMenu.appendChild(btn);
                });
                playerSeasonCurrent.textContent = playerEpSeasonSelect.options[playerEpSeasonSelect.selectedIndex]?.textContent || `Season ${currentPlayerSeason}`;
                playerEpSeasonSelect.onchange = () => {
                    const season = parseInt(playerEpSeasonSelect.value);
                    playerSeasonCurrent.textContent = playerEpSeasonSelect.options[playerEpSeasonSelect.selectedIndex]?.textContent || `Season ${season}`;
                    playerSeasonMenu.querySelectorAll('button').forEach(b => b.classList.toggle('active', Number(b.dataset.season) === season));
                    fetchPlayerEpisodes(season);
                };
                fetchPlayerEpisodes(currentPlayerSeason);
            })
            .catch(() => {
                playerEpList.innerHTML = '<div class="episode-no-results" style="color:#fff;text-align:center;padding:20px;">Failed to load seasons</div>';
            });
    }

    function fetchPlayerEpisodes(seasonNum) {
        playerEpLoading.style.display = 'flex';
        playerEpList.innerHTML = '';
        playerEpList.appendChild(playerEpLoading);

        fetch(`/api/episodes?id=${currentPlayerMovie.id}&season=${seasonNum}`)
            .then(r => r.json())
            .then(data => {
                playerEpList.innerHTML = '';
                const episodes = (data.episodes || []).filter(ep => ep.episode_number > 0);
                if (episodes.length === 0) {
                    playerEpList.innerHTML = '<div class="episode-no-results" style="color:#fff;text-align:center;padding:20px;">No episodes</div>';
                    return;
                }
                episodes.forEach(ep => {
                    const item = document.createElement('div');
                    item.className = 'player-ep-item';
                    if (seasonNum === currentPlayerSeason && ep.episode_number === currentPlayerEpisode) {
                        item.classList.add('active');
                    }
                    
                    const img = document.createElement('img');
                    img.className = 'player-ep-item-img';
                    img.src = ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : 'https://placehold.co/300x170/1a1a2e/ffffff?text=No+Image';
                    
                    const info = document.createElement('div');
                    info.className = 'player-ep-item-info';
                    
                    const title = document.createElement('div');
                    title.className = 'player-ep-item-title';
                    title.textContent = `${ep.episode_number}. ${ep.name}`;
                    
                    const meta = document.createElement('div');
                    meta.className = 'player-ep-item-meta';
                    meta.textContent = ep.runtime ? `${ep.runtime} min` : '';

                    info.appendChild(title);
                    if (ep.runtime) info.appendChild(meta);
                    
                    item.appendChild(img);
                    item.appendChild(info);

                    item.addEventListener('click', () => {
                        playerEpPanel.classList.remove('show');
                        launchPlayer(currentPlayerMovie, seasonNum, ep.episode_number);
                    });
                    
                    playerEpList.appendChild(item);
                });
            })
            .catch(() => {
                playerEpList.innerHTML = '<div class="episode-no-results" style="color:#fff;text-align:center;padding:20px;">Failed to load episodes</div>';
            });
    }

    function showPlayerError(message) {
        playerReady = false;
        playerLoader.innerHTML = `
            <div class="player-error">
                <div class="player-error-icon">!</div>
                <strong>Unable to play this title</strong>
                <span>${escapeHtml(message)}</span>
                <button type="button" class="player-error-btn" id="player-retry">Try again</button>
            </div>`;
        playerLoader.style.display = 'flex';
        document.getElementById('player-retry')?.addEventListener('click', () => {
            if (currentPlayerMovie) launchPlayer(currentPlayerMovie, currentPlayerSeason, currentPlayerEpisode);
        }, { once: true });
    }

    function resetPlayerUI(server) {
        const custom = server === 'vixsrc';
        [playerControlsBottom, playerCenterPlay].forEach(el => {
            if (el) el.style.display = custom ? '' : 'none';
        });
        playerModal.classList.toggle('iframe-mode', !custom);
        if (playerProgress) playerProgress.value = 0;
        if (playerTime) playerTime.textContent = '0:00 / 0:00';
        if (playerVolume) playerVolume.value = vixPlayer.muted ? 0 : vixPlayer.volume || 1;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    }

    function closePlayerModal() {
        playerRequestId++;
        clearTimeout(controlsHideTimer);
        playerModal.classList.remove('show');
        playerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            playerModal.style.display = 'none';
            stopVixPlayback();
            vidkingPlayer.src = '';
            vidkingPlayer.style.display = 'none';
            vixPlayer.style.display = 'none';
            playerLoader.innerHTML = '<div class="player-spinner"></div>';
            playerLoader.style.display = 'flex';
            resetPlayerUI('vixsrc');
        }, 350);
    }

    function showControls() {
        playerModal.classList.add('player-controls-visible');
        playerControlsTop.classList.remove('hidden');
        if (playerControlsBottom) playerControlsBottom.classList.remove('hidden');
        playerModal.style.cursor = 'default';
        clearTimeout(controlsHideTimer);
        controlsHideTimer = setTimeout(() => {
            playerControlsTop.classList.add('hidden');
            if (playerControlsBottom) playerControlsBottom.classList.add('hidden');
            playerModal.classList.remove('player-controls-visible');
            playerModal.style.cursor = 'none';
        }, 3000);
    }

    function formatPlayerTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        seconds = Math.max(0, Math.floor(seconds));
        const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
        return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
    }
    function updatePlayerPlayIcon() {
        const playing = !vixPlayer.paused;
        const pause = '<rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect>';
        const play = '<polygon points="8,5 19,12 8,19"></polygon>';
        if (playerPlayIcon) playerPlayIcon.innerHTML = playing ? pause : play;
        if (playerCenterPlayIcon) playerCenterPlayIcon.innerHTML = playing ? pause : play;
        if (playerCenterPlay) {
            playerCenterPlay.classList.toggle('is-paused', !playing);
            playerCenterPlay.classList.toggle('is-playing', playing);
        }
    }
    function toggleVixPlay() {
        if (activePlayerServer !== 'vixsrc' || !playerReady) return;
        if (vixPlayer.paused) vixPlayer.play().catch(() => {}); else vixPlayer.pause();
        showControls();
    }

    if (playerPlay) playerPlay.addEventListener('click', toggleVixPlay);
    if (playerCenterPlay) playerCenterPlay.addEventListener('click', toggleVixPlay);
    vixPlayer.addEventListener('click', () => { if (activePlayerServer === 'vixsrc' && playerReady) toggleVixPlay(); });
    vixPlayer.addEventListener('play', updatePlayerPlayIcon);
    vixPlayer.addEventListener('pause', updatePlayerPlayIcon);
    vixPlayer.addEventListener('timeupdate', () => {
        const duration = Number.isFinite(vixPlayer.duration) ? vixPlayer.duration : 0;
        if (playerProgress) { const pct = duration ? (vixPlayer.currentTime / duration) * 100 : 0; playerProgress.value = pct; playerProgress.style.setProperty('--progress', `${pct}%`); }
        if (playerTime) playerTime.textContent = `${formatPlayerTime(vixPlayer.currentTime)} / ${formatPlayerTime(duration)}`;
    });
    vixPlayer.addEventListener('loadedmetadata', () => {
        if (playerTime) playerTime.textContent = `0:00 / ${formatPlayerTime(vixPlayer.duration)}`;
        updatePlayerPlayIcon();
    });
    vixPlayer.addEventListener('ended', () => {
        updatePlayerPlayIcon();
        if (currentPlayerMovie?.type === 'tv') {
            setTimeout(() => { if (playerModal.classList.contains('show')) playerNextEp.click(); }, 500);
        }
    });
    if (playerProgress) playerProgress.addEventListener('input', () => {
        if (activePlayerServer !== 'vixsrc' || !Number.isFinite(vixPlayer.duration)) return;
        vixPlayer.currentTime = (Number(playerProgress.value) / 100) * vixPlayer.duration;
        showControls();
    });
    if (playerSkipBack) playerSkipBack.addEventListener('click', () => { if (activePlayerServer === 'vixsrc') vixPlayer.currentTime = Math.max(0, vixPlayer.currentTime - 10); showControls(); });
    if (playerSkipForward) playerSkipForward.addEventListener('click', () => { if (activePlayerServer === 'vixsrc' && Number.isFinite(vixPlayer.duration)) vixPlayer.currentTime = Math.min(vixPlayer.duration, vixPlayer.currentTime + 10); showControls(); });
    if (playerMute) playerMute.addEventListener('click', () => {
        if (activePlayerServer !== 'vixsrc') return;
        vixPlayer.muted = !vixPlayer.muted;
        if (playerVolume) playerVolume.value = vixPlayer.muted ? 0 : vixPlayer.volume;
        showControls();
    });
    if (playerVolume) playerVolume.addEventListener('input', () => {
        if (activePlayerServer !== 'vixsrc') return;
        vixPlayer.volume = Number(playerVolume.value);
        vixPlayer.muted = vixPlayer.volume === 0;
        showControls();
    });
    if (playerFullscreen) playerFullscreen.addEventListener('click', () => {
        const target = playerModal;
        if (!document.fullscreenElement) target.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.().catch(() => {});
        showControls();
    });

    playerModal.addEventListener('mousemove', (e) => {
        if (!playerModal.classList.contains('show')) return;
        if (e.target.closest('.player-ep-panel')) return;
        showControls();
    });
    playerModal.addEventListener('mouseleave', () => { clearTimeout(controlsHideTimer); playerControlsTop.classList.add('hidden'); if (playerControlsBottom) playerControlsBottom.classList.add('hidden'); });
    closePlayer.addEventListener('click', closePlayerModal);

    // ─── Keyboard shortcuts ───────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (playerEpPanel.classList.contains('show')) { playerEpPanel.classList.remove('show'); return; }
            if (playerModal.classList.contains('show'))   { closePlayerModal();   return; }
            if (detailModal.classList.contains('show'))   { closeDetailModal();   return; }
            if (searchOverlay.classList.contains('show')) { closeSearch();        return; }
        }
        if ((e.key === '/' || e.key === 'f') && !e.ctrlKey && !e.metaKey) {
            const tag = document.activeElement.tagName;
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
                e.preventDefault();
                openSearch();
            }
        }
    });

    // ─── Initial Load ─────────────────────────────────────────────────────────
    showLoadingSkeleton();
    fetchAndRender('/api/home', 'home');
});
