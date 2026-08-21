document.addEventListener('DOMContentLoaded', () => {
    // ─── DOM References ──────────────────────────────────────────────────────
    const navbar              = document.getElementById('navbar');
    const hero                = document.getElementById('hero');
    const heroBgLayer         = document.getElementById('hero-bg-layer');
    const heroClickArea       = document.getElementById('hero-click-area');
    const heroTitle           = document.getElementById('hero-title');
    const heroDesc            = document.getElementById('hero-desc');
    const heroMetaRow         = document.getElementById('hero-meta-row');
    const heroPlay            = document.getElementById('hero-play');
    const heroInfo            = document.getElementById('hero-info');
    const heroAddList         = document.getElementById('hero-add-list');
    const heroDots            = document.getElementById('hero-dots');
    const heroTypeBadge       = document.getElementById('hero-type-badge');
    const heroMaturityBadge   = document.getElementById('hero-maturity-badge');
    const heroButtonsEl       = document.querySelector('.hero-buttons');
    const heroBadgeRowEl      = document.querySelector('.hero-badge-row');
    const profileWrap         = document.getElementById('profile-wrap');
    const profileBtn          = document.getElementById('profile-btn');
    const profileMenuMyList   = document.getElementById('profile-menu-mylist');
    const profileMenuAccount  = document.getElementById('profile-menu-account');
    const profileMenuSignout  = document.getElementById('profile-menu-signout');
    const carouselsContainer  = document.getElementById('carousels-container');
    const mylistEmpty         = document.getElementById('mylist-empty');
    const mylistBrowseBtn     = document.getElementById('mylist-browse-btn');
    const pageLoader          = document.getElementById('page-loader');

    // Player
    const playerModal         = document.getElementById('player-modal');
    const closePlayer         = document.getElementById('close-player');
    const vixPlayer           = document.getElementById('vix-player');
    const playerMovieTitle    = document.getElementById('player-movie-title');
    const playerControlTitle  = document.getElementById('player-control-title');
    const playerMovieSubtitle = document.getElementById('player-movie-subtitle');
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
    const playerTimeCurrent   = document.getElementById('player-time-current');
    const playerTimeDuration  = document.getElementById('player-time-duration');
    const playerMute          = document.getElementById('player-mute');
    const playerVolume        = document.getElementById('player-volume');
    const playerVolumeIcon    = document.getElementById('player-volume-icon');
    const playerSeekZoneLeft     = document.getElementById('player-seek-zone-left');
    const playerSeekZoneRight    = document.getElementById('player-seek-zone-right');
    const playerSeekIndicatorLeft   = document.getElementById('player-seek-indicator-left');
    const playerSeekIndicatorRight  = document.getElementById('player-seek-indicator-right');
    const playerSeekAmountLeft      = document.getElementById('player-seek-amount-left');
    const playerSeekAmountRight     = document.getElementById('player-seek-amount-right');
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
    const mobileNavToggle     = document.getElementById('mobile-nav-toggle');
    const primaryNavigation   = document.getElementById('primary-navigation');
    const appToast            = document.getElementById('app-toast');

    // ─── State ───────────────────────────────────────────────────────────────
    let currentPage       = 'home';
    let heroMovies        = [];
    let heroIndex         = 0;
    let heroRotateTimer   = null;
    let controlsHideTimer = null;
    let playerCloseTimer  = null;
    let searchDebounce    = null;
    let searchRequestId   = 0;
    let catalogRequestId  = 0;
    let detailRequestId   = 0;
    let playerRequestId   = 0;
    let currentDetailMovie = null;
    let currentDetailData  = null;
    let currentEpisodes    = [];
    let trailerVisible     = false;
    let currentPlayerMovie    = null;
    let currentPlayerSeason   = null;
    let currentPlayerEpisode  = null;
    let vixHlsInstance        = null;
    let activePlayerServer   = 'vidking';
    let playerReady          = false;
    let playerAudioTracks    = [];
    let playerSubtitleTracks = [];
    let externalSubtitleTracks = []; // Subtitles fetched from subs.external.to
    let playerAudioInitialized = false;
    let pendingResumePosition = 0;
    let lastSavedPlaybackSecond = 0;
    let toastTimer = null;
    let heroCrossfadeTimer = null;

    // ─── Page Loading Screen ─────────────────────────────────────────────────
    // Hide the loader after animation completes, then reveal content with fade-in
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.classList.add('hidden');
            document.body.classList.add('content-revealed');
        }, 1900);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function mediaKey(movie) {
        if (!movie || typeof movie !== 'object') return '';
        return `${movie.type || 'movie'}-${movie.id}`;
    }
    function syncBodyOverflow() {
        const lock = detailModal.classList.contains('show')
            || playerModal.classList.contains('show')
            || searchOverlay.classList.contains('show');
        document.body.style.overflow = lock ? 'hidden' : '';
    }
    function showToast(message) {
        if (!appToast) return;
        clearTimeout(toastTimer);
        appToast.textContent = message;
        appToast.classList.add('show');
        toastTimer = setTimeout(() => appToast.classList.remove('show'), 2600);
    }

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
    function isInMyList(movie) {
        const key = mediaKey(movie);
        return getMyList().some(m => mediaKey(m) === key);
    }
    function toggleMyList(movie) {
        let list = getMyList();
        const key = mediaKey(movie);
        const idx = list.findIndex(m => mediaKey(m) === key);
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
            primaryNavigation?.classList.remove('open');
            mobileNavToggle?.setAttribute('aria-expanded', 'false');
            switchPage(link.dataset.page);
        });
    });

    mobileNavToggle?.addEventListener('click', () => {
        const open = primaryNavigation?.classList.toggle('open');
        mobileNavToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileNavToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });

    // ─── Profile dropdown ───────────────────────────────────────────────────
    function closeProfileMenu() {
        profileWrap?.classList.remove('open');
        profileBtn?.setAttribute('aria-expanded', 'false');
    }
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = profileWrap.classList.toggle('open');
        profileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    profileBtn?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileMenu();
    });
    profileMenuMyList?.addEventListener('click', () => {
        closeProfileMenu();
        primaryNavigation?.classList.remove('open');
        switchPage('mylist');
    });
    profileMenuAccount?.addEventListener('click', () => {
        closeProfileMenu();
        showToast('Account settings aren\u2019t available in this demo');
    });
    profileMenuSignout?.addEventListener('click', () => {
        closeProfileMenu();
        showToast('Sign out isn\u2019t available in this demo');
    });
    document.addEventListener('click', (e) => {
        if (profileWrap && !profileWrap.contains(e.target)) closeProfileMenu();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileMenu();
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

        // Smooth scroll to top when switching pages
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (page === 'mylist') {
            catalogRequestId++;
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
        const requestId = ++catalogRequestId;
        fetch(endpoint)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(movies => {
                if (requestId !== catalogRequestId) return;
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
                if (requestId !== catalogRequestId) return;
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
            if (heroTypeBadge) heroTypeBadge.textContent = '';

            // This "hero" isn't a real title — it's just filling the banner
            // space while the list is empty. Hide the badge row and action
            // buttons, and strip any click handlers left over from the last
            // real movie shown, so Play/More Info/My List can't fire against
            // stale data (previously this could open the player on whatever
            // movie was last featured on the homepage).
            heroBadgeRowEl?.style.setProperty('display', 'none');
            heroButtonsEl?.style.setProperty('display', 'none');
            heroPlay.onclick = null;
            heroInfo.onclick = null;
            heroAddList.onclick = null;
            heroClickArea.onclick = null;
            heroClickArea.onkeydown = null;
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

    /**
     * Crossfade the hero background to a new image using the overlay layer.
     * The layer fades in with the new image, then the main hero bg swaps instantly,
     * and the layer fades back out — giving a smooth Netflix-style dissolve.
     */
    function crossfadeHero(newUrl) {
        if (!heroBgLayer || !newUrl) {
            if (newUrl) hero.style.backgroundImage = `url('${CSS.escape(newUrl)}')`;
            return;
        }

        // Set new image on the crossfade layer and reveal it
        heroBgLayer.style.backgroundImage = `url('${CSS.escape(newUrl)}')`;
        heroBgLayer.classList.add('fading-in');

        // After the fade completes, swap the main hero background silently
        clearTimeout(heroCrossfadeTimer);
        heroCrossfadeTimer = setTimeout(() => {
            hero.style.backgroundImage = `url('${CSS.escape(newUrl)}')`;
            // Fade the layer back out (it now matches main — invisible seam)
            heroBgLayer.classList.remove('fading-in');
        }, 950);
    }

    function setHero(movie) {
        // Coming back from an empty-state page (e.g. My List with nothing
        // saved) which hides the action buttons/badge row — make sure a
        // real movie always restores them.
        heroButtonsEl?.style.removeProperty('display');
        heroBadgeRowEl?.style.removeProperty('display');

        if (movie.banner) {
            crossfadeHero(movie.banner);
        }
        heroTitle.textContent = movie.title;
        heroDesc.textContent  = movie.description || '';

        // Type badge
        if (heroTypeBadge) {
            heroTypeBadge.textContent = movie.type === 'tv' ? 'SERIES' : 'FILM';
        }
        // Maturity badge (placeholder — backend doesn't send this yet).
        // Hide the pill entirely instead of leaving an empty bordered box.
        if (heroMaturityBadge) {
            heroMaturityBadge.textContent = '';
            heroMaturityBadge.style.display = 'none';
        }

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
            showToast(added ? `${movie.title} added to My List` : `${movie.title} removed from My List`);
        };
        const inList = isInMyList(movie);
        heroAddList.classList.toggle('in-list', inList);
        const heroListSvg = heroAddList.querySelector('svg');
        if (heroListSvg) heroListSvg.style.transform = inList ? 'rotate(45deg)' : '';
    }

    function buildHeroDots(count, active) {
        heroDots.innerHTML = '';
        if (count <= 1) return;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.className = 'hero-dot' + (i === active ? ' active' : '');
            dot.setAttribute('aria-label', `Show hero ${i + 1}`);
            dot.addEventListener('click', e => {
                e.stopPropagation();
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

        rowDiv.appendChild(rowHeader);

        // Scroll wrap with edge arrows
        const scrollWrap = document.createElement('div');
        scrollWrap.className = 'row-scroll-wrap';

        const edgeLeft = document.createElement('button');
        edgeLeft.className = 'row-edge-arrow row-edge-arrow-left';
        edgeLeft.setAttribute('aria-label', 'Scroll left');
        edgeLeft.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

        const edgeRight = document.createElement('button');
        edgeRight.className = 'row-edge-arrow row-edge-arrow-right';
        edgeRight.setAttribute('aria-label', 'Scroll right');
        edgeRight.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

        const postersDiv = document.createElement('div');
        postersDiv.className = 'row-posters';

        const scrollAmount = 700;
        const doScrollLeft  = () => postersDiv.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        const doScrollRight = () => postersDiv.scrollBy({ left:  scrollAmount, behavior: 'smooth' });

        edgeLeft.addEventListener('click', doScrollLeft);
        edgeRight.addEventListener('click', doScrollRight);

        movies.forEach(movie => postersDiv.appendChild(createPosterCard(movie, false, isContinueWatching)));

        // ── Keyboard navigation for the poster row ───────────────────────────
        postersDiv.setAttribute('tabindex', '0');
        postersDiv.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); postersDiv.scrollBy({ left: 220, behavior: 'smooth' }); }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); postersDiv.scrollBy({ left: -220, behavior: 'smooth' }); }
        });

        scrollWrap.appendChild(edgeLeft);
        scrollWrap.appendChild(postersDiv);
        scrollWrap.appendChild(edgeRight);

        rowDiv.appendChild(scrollWrap);
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

        // Quick-action buttons inside the overlay
        const overlayActions = document.createElement('div');
        overlayActions.className = 'poster-overlay-actions';

        const quickPlay = document.createElement('button');
        quickPlay.className = 'poster-quick-play';
        quickPlay.setAttribute('aria-label', `Play ${movie.title}`);
        quickPlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        quickPlay.addEventListener('click', e => {
            e.stopPropagation();
            openPlayer(movie);
        });

        const quickList = document.createElement('button');
        quickList.className = 'poster-quick-list';
        quickList.setAttribute('aria-label', isInMyList(movie) ? 'Remove from My List' : 'Add to My List');
        quickList.innerHTML = isInMyList(movie)
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        quickList.addEventListener('click', e => {
            e.stopPropagation();
            const added = toggleMyList(movie);
            quickList.innerHTML = added
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
            showToast(added ? `${movie.title} added to My List` : `${movie.title} removed from My List`);
        });

        overlayActions.appendChild(quickPlay);
        overlayActions.appendChild(quickList);

        const pTitle = document.createElement('div');
        pTitle.className = 'poster-title';
        pTitle.textContent = movie.title;

        overlay.appendChild(overlayActions);
        overlay.appendChild(pTitle);
        wrapper.appendChild(img);
        wrapper.appendChild(overlay);

        // Continue Watching: progress bar + remove button
        if (isContinueWatching) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'poster-remove-btn';
            removeBtn.setAttribute('aria-label', 'Remove from Continue Watching');
            removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            removeBtn.addEventListener('click', e => {
                e.stopPropagation();
                removeFromContinueWatching(movie);
                card.remove();
            });
            wrapper.appendChild(removeBtn);

            // Progress bar
            const prog = getProgress(movie);
            const progressWrap = document.createElement('div');
            progressWrap.className = 'poster-progress-wrap';
            const progressBar = document.createElement('div');
            progressBar.className = 'poster-progress-bar';
            // Try to estimate progress from saved position vs. a rough duration estimate
            // We don't have duration here so we just show a bar if there's a saved position > 0
            if (prog && prog.position && prog.position > 0) {
                // Show ~40% as a reasonable indicator that the user has started watching
                progressBar.style.width = Math.min(95, Math.max(8, (prog.position / 3600) * 30)) + '%';
            } else {
                progressBar.style.width = '0%';
            }
            progressWrap.appendChild(progressBar);
            wrapper.appendChild(progressWrap);
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
        // Use textContent for the message to prevent XSS injection.
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        icon.setAttribute('width', '20'); icon.setAttribute('height', '20');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none'); icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2'); icon.setAttribute('stroke-linecap', 'round');
        icon.setAttribute('stroke-linejoin', 'round');
        icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
        const msgEl = document.createElement('span');
        msgEl.textContent = msg;
        err.appendChild(icon);
        err.appendChild(msgEl);
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
        detailRating.style.display = 'none';
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
        const inList = isInMyList(movie);
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
            showToast(added ? `${movie.title} added to My List` : `${movie.title} removed from My List`);
        };

        // Show modal
        detailModal.style.display = 'flex';
        detailModal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            detailModal.classList.add('show');
            syncBodyOverflow();
        }));

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
            detailRating.style.display = '';
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

            if (!trailerKey) {
                const teaser = d.videos.results.find(v => v.site === 'YouTube' && v.type === 'Teaser');
                if (teaser) trailerKey = teaser.key;
            }
        }

        if (trailerKey) {
            // Validate the key is safe before embedding in a URL.
            const safeKey = /^[A-Za-z0-9_-]{5,20}$/.test(trailerKey) ? trailerKey : null;
            if (safeKey) {
                detailTrailerBtn.style.display = '';
                detailTrailerBtn.onclick = () => toggleTrailer(safeKey);
            }
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

        loadEpisodes(movie.id, seasons[0].season_number);
    }

    function loadEpisodes(tvId, seasonNum) {
        detailEpLoading.style.display = 'flex';
        detailEpisodeList.innerHTML = '';
        detailEpisodeList.appendChild(detailEpLoading);
        detailEpSearch.value = '';
        currentEpisodes = [];

        fetch(`/api/episodes?id=${encodeURIComponent(tvId)}&season=${encodeURIComponent(seasonNum)}`)
            .then(r => {
                if (!r.ok) throw new Error('episodes fetch failed');
                return r.json();
            })
            .then(data => {
                currentEpisodes = (data.episodes || []).filter(ep => ep.episode_number > 0);
                renderEpisodeList(currentEpisodes);
            })
            .catch(() => {
                detailEpisodeList.innerHTML = '<div class="episode-no-results">Could not load episodes.</div>';
            });
    }

    function renderEpisodeList(episodes) {
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

            item.appendChild(numBadge);
            item.appendChild(stillWrap);
            item.appendChild(info);

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
            renderEpisodeList(currentEpisodes);
            return;
        }
        const filtered = currentEpisodes.filter(ep =>
            (ep.name || '').toLowerCase().includes(q) ||
            (ep.overview || '').toLowerCase().includes(q)
        );
        renderEpisodeList(filtered);
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
        syncBodyOverflow();
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
        syncBodyOverflow();
        setTimeout(() => searchInput.focus(), 100);
    }

    function closeSearch() {
        searchRequestId++;
        searchOverlay.classList.remove('show');
        searchOverlay.setAttribute('aria-hidden', 'true');
        syncBodyOverflow();
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

    // ─── Progress Tracking (localStorage) ────────────────────────────────────
    function getProgress(movie) {
        try {
            const prog = JSON.parse(localStorage.getItem('gsflix_progress') || '{}');
            const key = mediaKey(movie);
            return prog[key] || prog[movie.id] || { season: 1, episode: 1 };
        }
        catch { return { season: 1, episode: 1 }; }
    }
    function saveProgress(movie, season, episode, position) {
        try {
            const prog = JSON.parse(localStorage.getItem('gsflix_progress') || '{}');
            const key = mediaKey(movie);
            const previous = prog[key] || {};
            const sameEpisode = previous.season === season && previous.episode === episode;
            delete prog[movie.id];
            prog[key] = {
                season,
                episode,
                position: Number.isFinite(position) ? Math.max(0, position) : (sameEpisode ? previous.position || 0 : 0)
            };
            localStorage.setItem('gsflix_progress', JSON.stringify(prog));
        } catch (e) { console.warn('Could not save playback progress:', e); }
    }

    function addToContinueWatching(movie) {
        try {
            let cw = JSON.parse(localStorage.getItem('gsflix_cw') || '[]');
            const key = mediaKey(movie);
            cw = cw.filter(m => mediaKey(m) !== key);
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

    function removeFromContinueWatching(movie) {
        try {
            let cw = JSON.parse(localStorage.getItem('gsflix_cw') || '[]');
            const key = mediaKey(movie);
            cw = cw.filter(m => mediaKey(m) !== key);
            localStorage.setItem('gsflix_cw', JSON.stringify(cw));
        } catch (e) { console.warn('Could not update continue-watching state:', e); }
    }

    // ─── Player ───────────────────────────────────────────────────────────────
    function openPlayer(movie) {
        if (movie.type === 'tv') {
            const prog = getProgress(movie);
            launchPlayer(movie, prog.season, prog.episode);
        } else {
            launchPlayer(movie);
        }
    }

    // ─── External Subtitle Fetching ────────────────────────────────────────────
    // Fetches and aggregates external subtitles from all backend providers in parallel,
    // deduplicating by language/label to guarantee maximum subtitle coverage.
    async function fetchAllExternalSubtitles(movie, season, episode) {
        if (!movie || !movie.id) return [];
        const providers = ['vidking', 'vidlove'];
        const promises = providers.map(async (provider) => {
            try {
                let endpoint;
                if (movie.type === 'tv') {
                    endpoint = `/api/subtitles/${provider}?type=tv&id=${encodeURIComponent(movie.id)}&season=${encodeURIComponent(season || 1)}&episode=${encodeURIComponent(episode || 1)}`;
                } else {
                    endpoint = `/api/subtitles/${provider}?type=movie&id=${encodeURIComponent(movie.id)}`;
                }
                const res = await fetch(endpoint, { method: 'GET', credentials: 'same-origin' });
                if (!res.ok) return [];
                const data = await res.json();
                if (!data.success || !Array.isArray(data.subtitles)) return [];
                return data.subtitles;
            } catch (e) {
                console.warn(`[Subtitles] Fetch from ${provider} failed:`, e);
                return [];
            }
        });

        const results = await Promise.allSettled(promises);
        const combined = [];
        const seen = new Set();

        for (const res of results) {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                for (const sub of res.value) {
                    if (!sub || !sub.url) continue;
                    const key = `${(sub.language || '').toLowerCase().trim()}__${(sub.label || '').toLowerCase().trim()}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        combined.push(sub);
                    }
                }
            }
        }
        return combined;
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

    function chooseDefaultSubtitleIndex(tracks) {
        if (!tracks.length) return -1;
        const english = tracks.findIndex(isEnglishTrack);
        if (english >= 0) return english;
        const preferred = tracks.findIndex(isDefaultTrack);
        return preferred >= 0 ? preferred : 0;
    }

    // chooseDefaultExternalSubtitleIndex picks the best External subtitle using
    // the priority: English (non-HI) > English (HI) > first available.
    function chooseDefaultExternalSubtitleIndex(subs) {
        if (!subs || !subs.length) return -1;
        // Prefer English non-HI.
        const enNonHI = subs.findIndex(s => {
            const lang = (s.language || '').toLowerCase();
            const label = (s.label || '').toLowerCase();
            const isEn = lang.startsWith('en') || label.includes('english');
            return isEn && !label.includes('(hi)');
        });
        if (enNonHI >= 0) return enNonHI;
        // Then English HI.
        const enHI = subs.findIndex(s => {
            const lang = (s.language || '').toLowerCase();
            const label = (s.label || '').toLowerCase();
            return (lang.startsWith('en') || label.includes('english')) && label.includes('(hi)');
        });
        if (enHI >= 0) return enHI;
        // Fallback: first subtitle.
        return 0;
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
            empty.textContent = type === 'audio' ? 'No alternate audio from this server' : 'No subtitles from this server';
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
        const label = track ? normalizeTrackLabel(track, isEnglishTrack(track) ? 'English' : 'Original', index) : 'Original';
        playerAudioCurrent.textContent = label;
        if (playerAudioTrigger) {
            playerAudioTrigger.title = `Audio: ${label}`;
            playerAudioTrigger.setAttribute('aria-label', `Audio, ${label}`);
        }
        playerAudioMenu?.querySelectorAll('[data-track-index]').forEach(button => {
            button.setAttribute('aria-selected', Number(button.dataset.trackIndex) === index ? 'true' : 'false');
        });
    }

    function syncPlayerSubtitleMenu(labelOrIndex) {
        if (!playerSubtitleCurrent) return;
        // Accept both a plain label string and a numeric track index (legacy HLS path).
        let label;
        if (typeof labelOrIndex === 'string') {
            label = labelOrIndex;
        } else {
            const index = labelOrIndex;
            label = index >= 0 && playerSubtitleTracks[index]
                ? normalizeTrackLabel(playerSubtitleTracks[index], 'Subtitles', index)
                : 'Off';
        }
        playerSubtitleCurrent.textContent = label;
        if (playerSubtitleTrigger) {
            playerSubtitleTrigger.title = `Subtitles: ${label}`;
            playerSubtitleTrigger.setAttribute('aria-label', `Subtitles, ${label}`);
        }
    }

    function updatePlayerTrackMenus() {
        const audioIndex = vixHlsInstance ? vixHlsInstance.audioTrack : -1;
        const hlsSubIndex = vixHlsInstance ? vixHlsInstance.subtitleTrack : -1;

        // Build the audio menu as before.
        renderTrackMenu(playerAudioMenu, playerAudioTracks, audioIndex, 'audio');
        syncPlayerAudioMenu(audioIndex);
        if (playerAudioPicker) playerAudioPicker.style.display = playerAudioTracks.length > 1 ? '' : 'none';

        // Build a unified subtitle menu: External tracks first, then HLS tracks.
        renderSubtitleTrackMenu(hlsSubIndex);
    }

    // Renders the subtitle picker with External tracks at the top and HLS.js
    // subtitle tracks below, merging them into a single unified list.
    function renderSubtitleTrackMenu(hlsSubIndex) {
        if (!playerSubtitleMenu) return;
        playerSubtitleMenu.innerHTML = '';

        const hasExternal = externalSubtitleTracks.length > 0;
        const hasHLS = playerSubtitleTracks.length > 0;

        if (!hasExternal && !hasHLS) {
            const empty = document.createElement('div');
            empty.className = 'player-track-empty';
            empty.textContent = 'No subtitles from this server';
            playerSubtitleMenu.appendChild(empty);
            if (playerSubtitlePicker) playerSubtitlePicker.style.display = 'none';
            return;
        }

        // "Off" button.
        const off = document.createElement('button');
        off.type = 'button';
        off.role = 'option';
        off.dataset.trackIndex = '-1';
        off.dataset.trackSource = 'off';
        const isOff = hlsSubIndex < 0 && getActiveExternalIndex() === -1;
        off.setAttribute('aria-selected', isOff ? 'true' : 'false');
        off.innerHTML = '<span><strong>Off</strong></span><svg class="track-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        off.addEventListener('click', () => selectPlayerTrack('subtitle', -1));
        playerSubtitleMenu.appendChild(off);

        // External tracks.
        externalSubtitleTracks.forEach((sub, index) => {
            const activeIdx = getActiveExternalIndex();
            const button = document.createElement('button');
            button.type = 'button';
            button.role = 'option';
            button.dataset.trackIndex = String(index);
            button.dataset.trackSource = 'external';
            const selected = activeIdx === index;
            button.setAttribute('aria-selected', selected ? 'true' : 'false');
            button.innerHTML = `<span><strong>${escapeHtml(sub.label || sub.language || `Subtitle ${index + 1}`)}</strong></span><svg class="track-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            button.addEventListener('click', () => selectPlayerTrack('external-subtitle', index));
            playerSubtitleMenu.appendChild(button);
        });

        // HLS embedded subtitle tracks (if any, and if no External tracks are overriding).
        if (hasHLS && !hasExternal) {
            playerSubtitleTracks.forEach((track, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.role = 'option';
                button.dataset.trackIndex = String(index);
                button.dataset.trackSource = 'hls';
                button.setAttribute('aria-selected', index === hlsSubIndex ? 'true' : 'false');
                button.innerHTML = `<span><strong>${escapeHtml(normalizeTrackLabel(track, 'Subtitles', index))}</strong></span><svg class="track-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                button.addEventListener('click', () => selectPlayerTrack('subtitle', index));
                playerSubtitleMenu.appendChild(button);
            });
        }

        // Update the current-label display.
        const activeExternalIdx = getActiveExternalIndex();
        let currentLabel = 'Off';
        if (activeExternalIdx >= 0 && externalSubtitleTracks[activeExternalIdx]) {
            currentLabel = externalSubtitleTracks[activeExternalIdx].label || externalSubtitleTracks[activeExternalIdx].language || 'Subtitle';
        } else if (hlsSubIndex >= 0 && playerSubtitleTracks[hlsSubIndex]) {
            currentLabel = normalizeTrackLabel(playerSubtitleTracks[hlsSubIndex], 'Subtitles', hlsSubIndex);
        }
        syncPlayerSubtitleMenu(currentLabel);
        if (playerSubtitlePicker) playerSubtitlePicker.style.display = '';
    }

    function selectPlayerTrack(type, index) {
        if (type === 'audio' && vixHlsInstance && playerAudioTracks[index]) {
            vixHlsInstance.audioTrack = index;
            playerAudioInitialized = true;
            syncPlayerAudioMenu(index);
        } else if (type === 'external-subtitle') {
            // Activate a External <track> element and disable all others.
            if (vixHlsInstance) vixHlsInstance.subtitleTrack = -1;
            activateExternalTrack(index);
            updatePlayerTrackMenus();
        } else if (type === 'subtitle' && vixHlsInstance) {
            // Deactivate any External tracks, then enable the HLS one.
            deactivateAllExternalTracks();
            if (index >= 0) {
                vixHlsInstance.subtitleTrack = index;
            } else {
                vixHlsInstance.subtitleTrack = -1;
            }
            updatePlayerTrackMenus();
            syncPlayerSubtitleMenu('Off');
        }
        playerAudioPicker?.classList.remove('open');
        playerSubtitlePicker?.classList.remove('open');
        playerAudioTrigger?.setAttribute('aria-expanded', 'false');
        playerSubtitleTrigger?.setAttribute('aria-expanded', 'false');
    }

    // Returns the index of the currently active External <track> element, or -1.
    function getActiveExternalIndex() {
        const tracks = vixPlayer.querySelectorAll('track[data-external]');
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].track && tracks[i].track.mode === 'showing') return i;
        }
        return -1;
    }

    // Activates a single External track by index, disabling all others.
    function activateExternalTrack(index) {
        const tracks = vixPlayer.querySelectorAll('track[data-external]');
        tracks.forEach((el, i) => {
            if (el.track) el.track.mode = (i === index) ? 'showing' : 'disabled';
        });
    }

    // Disables all External <track> elements.
    function deactivateAllExternalTracks() {
        vixPlayer.querySelectorAll('track[data-external]').forEach(el => {
            if (el.track) el.track.mode = 'disabled';
        });
    }

    function resetPlayerTracks() {
        playerAudioTracks = [];
        playerSubtitleTracks = [];
        externalSubtitleTracks = [];
        playerAudioInitialized = false;
        if (playerAudioMenu) playerAudioMenu.innerHTML = '';
        if (playerSubtitleMenu) playerSubtitleMenu.innerHTML = '';
        if (playerAudioCurrent) playerAudioCurrent.textContent = 'Original';
        if (playerSubtitleCurrent) playerSubtitleCurrent.textContent = 'Off';
        if (playerAudioPicker) playerAudioPicker.style.display = 'none';
        if (playerSubtitlePicker) playerSubtitlePicker.style.display = 'none';
        // Remove any injected External <track> elements.
        vixPlayer.querySelectorAll('track[data-external]').forEach(t => t.remove());
    }

    async function launchPlayer(movie, season, episode) {
		clearTimeout(playerCloseTimer);
		playerCloseTimer = null;
        const requestId = ++playerRequestId;
        currentPlayerMovie = movie;
        currentPlayerSeason = season || 1;
        currentPlayerEpisode = episode || 1;
		const savedProgress = getProgress(movie);
		pendingResumePosition = savedProgress.season === currentPlayerSeason && savedProgress.episode === currentPlayerEpisode
			? Number(savedProgress.position) || 0 : 0;
		lastSavedPlaybackSecond = 0;
        vixPlayer.__resumeApplied = false; // reset one-shot resume guard for new launch

        if (movie.type === 'tv') {
            playerNextEp.style.display = 'flex';
            playerEpListBtn.style.display = 'flex';
        } else {
            playerNextEp.style.display = 'none';
            playerEpListBtn.style.display = 'none';
        }

        addToContinueWatching(movie);
        if (movie.type === 'tv') {
            saveProgress(movie, currentPlayerSeason, currentPlayerEpisode);
        }

        const server = playerServerSelect ? (playerServerSelect.value || 'vidking') : 'vidking';
        activePlayerServer = server;
        playerReady = false;
        playerMovieTitle.textContent = movie.title || '';
        if (playerControlTitle) {
            playerControlTitle.textContent = movie.type === 'tv'
                ? `${movie.title || ''} · S${currentPlayerSeason}:E${currentPlayerEpisode}`
                : (movie.title || '');
        }
        if (playerMovieSubtitle) {
            if (movie.type === 'tv') {
                playerMovieSubtitle.textContent = `Season ${currentPlayerSeason}  ·  Episode ${currentPlayerEpisode}`;
                playerMovieSubtitle.hidden = false;
            } else {
                playerMovieSubtitle.textContent = '';
                playerMovieSubtitle.hidden = true;
            }
        }

        playerLoader.innerHTML = '<div class="player-spinner"></div>';
        playerLoader.style.display = 'flex';
        playerModal.classList.remove('player-ready');
        playerModal.style.display = 'block';
        playerModal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            playerModal.classList.add('show');
            syncBodyOverflow();
            showControls();
        }));

        stopVixPlayback();
        resetPlayerTracks();
        resetPlayerUI();
        vixPlayer.playbackRate = 1;
        vixPlayer.style.display = 'block';

        // Fire External subtitle fetch in parallel with HLS source resolution across all providers
        let externalPromise = fetchAllExternalSubtitles(movie, currentPlayerSeason, currentPlayerEpisode);

        try {
            const provider = server === 'vidking' ? 'vidking' : (server === 'vidlove' ? 'vidlove' : 'vixsrc');
            const endpoint = movie.type === 'tv'
                ? `/api/media/source/${provider}/tv/${encodeURIComponent(movie.id)}/${encodeURIComponent(currentPlayerSeason)}/${encodeURIComponent(currentPlayerEpisode)}`
                : `/api/media/source/${provider}/movie/${encodeURIComponent(movie.id)}`;

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

            await loadVixSource(data.url, requestId, provider);

            // Apply External subtitles once the player is ready.
            if (requestId !== playerRequestId) return;
            const subs = await externalPromise;
            if (requestId !== playerRequestId) return;
            externalSubtitleTracks = Array.isArray(subs) ? subs : [];
            if (externalSubtitleTracks.length > 0) {
                applyExternalTracks();
            }
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
        // Do NOT call vixPlayer.load() here — removing the src attribute is
        // sufficient to reset the media element, and calling load() on an
        // empty source triggers a spurious browser media error.
        vixPlayer.onloadedmetadata = null;
        vixPlayer.onerror = null;
        // Remove any injected External <track> elements.
        vixPlayer.querySelectorAll('track[data-external]').forEach(t => t.remove());
    }

    function applyPlayerTracks(provider) {
        if (!vixHlsInstance) return;
        playerAudioTracks = vixHlsInstance.audioTracks || [];
        playerSubtitleTracks = vixHlsInstance.subtitleTracks || [];
        if (playerAudioTracks.length > 0 && !playerAudioInitialized) {
            vixHlsInstance.audioTrack = chooseDefaultAudioIndex(playerAudioTracks);
            playerAudioInitialized = true;
        }
        if (playerSubtitleTracks.length > 0 && vixHlsInstance.subtitleTrack < 0 && externalSubtitleTracks.length === 0) {
            const defaultSub = chooseDefaultSubtitleIndex(playerSubtitleTracks);
            if (defaultSub >= 0) {
                vixHlsInstance.subtitleTrack = defaultSub;
            }
        }
        updatePlayerTrackMenus();
    }

    // Injects External subtitle tracks as <track> elements into the video element
    // and re-renders the subtitle picker to include them alongside HLS tracks.
    function applyExternalTracks() {
        // Remove any previously injected External tracks.
        vixPlayer.querySelectorAll('track[data-external]').forEach(t => t.remove());

        const defaultIdx = chooseDefaultExternalSubtitleIndex(externalSubtitleTracks);

        externalSubtitleTracks.forEach((sub, i) => {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = sub.label;
            track.srclang = sub.language || '';
            track.src = sub.url;
            track.setAttribute('data-external', sub.id || String(i));
            track.mode = (i === defaultIdx) ? 'showing' : 'disabled';
            track.addEventListener('load', function() {
                if (i === defaultIdx && track.track) {
                    track.track.mode = 'showing';
                }
            });
            vixPlayer.appendChild(track);
        });

        // Turn off any HLS.js-managed subtitle track so External takes priority.
        if (vixHlsInstance && defaultIdx >= 0) {
            vixHlsInstance.subtitleTrack = -1;
        }

        // Auto-select the best External subtitle track.
        if (defaultIdx >= 0) {
            activateExternalTrack(defaultIdx);
        }

        updatePlayerTrackMenus();
    }

    function loadVixSource(url, requestId, provider = 'vixsrc') {
        return new Promise((resolve, reject) => {
            let settled = false;
			const playbackReadinessEvents = ['loadeddata', 'canplay', 'playing', 'loadedmetadata'];
			const cleanupReadinessListeners = () => {
				playbackReadinessEvents.forEach(event => vixPlayer.removeEventListener(event, tryStartPlayback));
			};
            const readyTimeout = setTimeout(() => {
                settleErr(new Error('Playback timed out while loading the stream'));
            }, 25000);

            const settleOk = () => {
                if (settled) return;
                settled = true;
                clearTimeout(readyTimeout);
				cleanupReadinessListeners();
                if (requestId !== playerRequestId) {
                    resolve();
                    return;
                }
                playerReady = true;
                playerLoader.style.display = 'none';
                playerModal.classList.add('player-ready');
                updatePlayerPlayIcon();
                showControls();
                resolve();
            };

            const settleErr = (err) => {
                if (settled) return;
                settled = true;
                clearTimeout(readyTimeout);
				cleanupReadinessListeners();
                reject(err instanceof Error ? err : new Error(String(err)));
            };

            const hasVideoFrame = () => vixPlayer.videoWidth > 0 && vixPlayer.videoHeight > 0;

            const tryStartPlayback = () => {
                if (settled || requestId !== playerRequestId) return;
                if (!hasVideoFrame()) {
                    return;
                }
                if (vixPlayer.paused) {
                    const playAttempt = vixPlayer.play();
                    if (playAttempt && typeof playAttempt.then === 'function') {
                        playAttempt.catch(() => {});
                    }
                }
                settleOk();
            };

            vixPlayer.onerror = () => settleErr(new Error('The resolved HLS source could not be loaded by the browser'));
            vixPlayer.addEventListener('loadeddata', tryStartPlayback);
            vixPlayer.addEventListener('canplay', tryStartPlayback);
            vixPlayer.addEventListener('playing', tryStartPlayback);

            if (window.Hls && Hls.isSupported()) {
                vixHlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    capLevelToPlayerSize: false,
                    renderTextTracksNatively: true,
                    autoStartLoad: true,
                    startLevel: 999,
                    // Buffer optimization for buffer-free 4K UHD & 1080p playback
                    maxBufferLength: 90,
                    maxMaxBufferLength: 180,
                    maxBufferSize: 256 * 1024 * 1024,
                    maxBufferHole: 0.5,
                    highBufferWatchdogPeriod: 2,
                    nudgeOffset: 0.1,
                    nudgeMaxRetry: 5,
                    fragLoadingTimeOut: 30000,
                    fragLoadingMaxRetry: 6,
                    fragLoadingRetryDelay: 500,
                    backBufferLength: 60,
                    progressive: true,
                    xhrSetup: function(xhr) {
                        xhr.withCredentials = false;
                    }
                });

                vixHlsInstance.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
                    if (requestId !== playerRequestId) return;
                    // Automatically lock playback to the highest available quality (4K 2160p, 1080p, or max bitrate).
                    if (data.levels && data.levels.length > 0) {
                        let highestLevelIndex = 0;
                        let maxScore = -1;
                        for (let i = 0; i < data.levels.length; i++) {
                            const lvl = data.levels[i];
                            const pixels = (lvl.width || 0) * (lvl.height || 0);
                            const bitrate = lvl.bitrate || 0;
                            const score = (pixels > 0 ? pixels * 1000 : 0) + bitrate;
                            if (score > maxScore) {
                                maxScore = score;
                                highestLevelIndex = i;
                            }
                        }
                        vixHlsInstance.startLevel = highestLevelIndex;
                        vixHlsInstance.currentLevel = highestLevelIndex;
                        vixHlsInstance.loadLevel   = highestLevelIndex;
                        vixHlsInstance.nextLevel   = highestLevelIndex;
                        vixHlsInstance.autoLevelEnabled = false;
                    }
                    applyPlayerTracks(provider);
                });
                vixHlsInstance.on(Hls.Events.FRAG_BUFFERED, function() {
                    if (requestId !== playerRequestId) return;
                    tryStartPlayback();
                });
                vixHlsInstance.on(Hls.Events.AUDIO_TRACKS_UPDATED, function() {
                    if (requestId !== playerRequestId) return;
                    applyPlayerTracks(provider);
                });
                vixHlsInstance.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function() {
                    if (requestId !== playerRequestId) return;
                    playerSubtitleTracks = vixHlsInstance.subtitleTracks || [];
                    if (playerSubtitleTracks.length > 0 && vixHlsInstance.subtitleTrack < 0 && externalSubtitleTracks.length === 0) {
                        vixHlsInstance.subtitleTrack = chooseDefaultSubtitleIndex(playerSubtitleTracks);
                    }
                    updatePlayerTrackMenus();
                });
                vixHlsInstance.on(Hls.Events.AUDIO_TRACK_SWITCHED, function() {
                    if (requestId !== playerRequestId) return;
                    syncPlayerAudioMenu(vixHlsInstance.audioTrack);
                });
                vixHlsInstance.on(Hls.Events.SUBTITLE_TRACK_SWITCH, function() {
                    if (requestId !== playerRequestId) return;
                    updatePlayerTrackMenus();
                });
                vixHlsInstance.on(Hls.Events.ERROR, function(event, data) {
                    if (requestId !== playerRequestId || settled) return;
                    console.error('[Player] HLS error:', data.type, data.details, data.error || '', data.response || '');
                    if (!data.fatal) return;
                    if (vixHlsInstance && !vixHlsInstance.__gsflixRecovered) {
                        vixHlsInstance.__gsflixRecovered = true;
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            vixHlsInstance.startLoad();
                        } else {
                            vixHlsInstance.recoverMediaError();
                        }
                        tryStartPlayback();
                        return;
                    }
                    let detail = data.details || 'HLS playback failed';
                    if (data.response && data.response.code) {
                        detail += ` (${data.response.code})`;
                    }
                    settleErr(new Error(detail));
                });

                // Reset recovery flag after successful playback resumes.
                vixHlsInstance.on(Hls.Events.FRAG_LOADED, function() {
                    if (vixHlsInstance && vixHlsInstance.__gsflixRecovered && !vixPlayer.paused) {
                        vixHlsInstance.__gsflixRecovered = false;
                    }
                });

                vixHlsInstance.loadSource(url);
                vixHlsInstance.attachMedia(vixPlayer);
                return;
            }

            if (vixPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                // Use an absolute URL. Some smart TV native players (like BrowseHere's)
                // cannot resolve relative URLs and will throw Player Error 3001.
                vixPlayer.src = new URL(url, window.location.origin).href;
                return;
            }

            settleErr(new Error('This browser does not support HLS playback'));
        });
    }

    // Episode panel logic
    async function playNextEpisode() {
        if (!currentPlayerMovie || currentPlayerMovie.type !== 'tv') return;
        const tvId = currentPlayerMovie.id;
        const season = currentPlayerSeason;
        const episode = currentPlayerEpisode;
        try {
            const epRes = await fetch(`/api/episodes?id=${encodeURIComponent(tvId)}&season=${encodeURIComponent(season)}`);
            if (!epRes.ok) throw new Error('episodes fetch failed');
            const data = await epRes.json();
            const episodes = (data.episodes || []).filter(ep => ep.episode_number > 0);
            const nextInSeason = episodes.find(ep => ep.episode_number === episode + 1)
                || episodes.find(ep => ep.episode_number > episode);
            if (nextInSeason) {
                launchPlayer(currentPlayerMovie, season, nextInSeason.episode_number);
                return;
            }
            const detailRes = await fetch(`/api/detail?id=${encodeURIComponent(tvId)}&type=tv`);
            if (!detailRes.ok) return;
            const detail = await detailRes.json();
            const seasons = (detail.seasons || [])
                .filter(s => s.season_number > season)
                .sort((a, b) => a.season_number - b.season_number);
            if (seasons.length) {
                launchPlayer(currentPlayerMovie, seasons[0].season_number, 1);
            }
        } catch (err) {
            console.warn('Could not resolve next episode:', err);
        }
    }

    playerNextEp.addEventListener('click', () => {
        playNextEpisode();
    });

    playerEpListBtn.addEventListener('click', () => {
        playerEpPanel.classList.add('show');
        playerEpListBtn.setAttribute('aria-expanded', 'true');
        loadPlayerEpisodesPanel();
    });

    function syncServerPicker() {
        if (!playerServerSelect) return;
        const value = playerServerSelect.value || 'vidking';
        const option = playerServerSelect.options[playerServerSelect.selectedIndex];
        const label = option ? option.textContent : value;
        if (playerServerCurrent) playerServerCurrent.textContent = label;
        if (playerServerTrigger) {
            playerServerTrigger.title = `Server: ${label}`;
            playerServerTrigger.setAttribute('aria-label', `Playback server, ${label}`);
        }
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
            if (currentPlayerMovie) {
                if (vixPlayer && Number.isFinite(vixPlayer.currentTime) && vixPlayer.currentTime > 0) {
                    saveProgress(currentPlayerMovie, currentPlayerSeason, currentPlayerEpisode, vixPlayer.currentTime);
                    pendingResumePosition = vixPlayer.currentTime;
                    vixPlayer.__resumeApplied = false;
                }
                const serverName = playerServerCurrent ? playerServerCurrent.textContent : 'server';
                showToast(`Switching to ${serverName} (Highest Quality)...`);
                launchPlayer(currentPlayerMovie, currentPlayerSeason, currentPlayerEpisode);
            }
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
        if (open) {
            playerAudioPicker?.classList.remove('open');
            playerSubtitlePicker?.classList.remove('open');
            playerAudioTrigger?.setAttribute('aria-expanded', 'false');
            playerSubtitleTrigger?.setAttribute('aria-expanded', 'false');
        }
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
        playerEpListBtn.setAttribute('aria-expanded', 'false');
    });

    function loadPlayerEpisodesPanel() {
        playerEpSeasonSelect.innerHTML = '';
        if (playerSeasonMenu) playerSeasonMenu.innerHTML = '';
        playerEpLoading.style.display = 'flex';
        playerEpList.innerHTML = '';
        playerEpList.appendChild(playerEpLoading);

        fetch(`/api/detail?id=${encodeURIComponent(currentPlayerMovie.id)}&type=tv`)
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

        fetch(`/api/episodes?id=${encodeURIComponent(currentPlayerMovie.id)}&season=${encodeURIComponent(seasonNum)}`)
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

    function resetPlayerUI() {
        [playerControlsBottom, playerCenterPlay].forEach(el => {
            if (el) el.style.display = '';
        });
        if (playerProgress) playerProgress.value = 0;
        if (playerTimeCurrent) playerTimeCurrent.textContent = '0:00';
        if (playerTimeDuration) playerTimeDuration.textContent = '0:00';
        if (playerVolume) playerVolume.value = vixPlayer.muted ? 0 : vixPlayer.volume || 1;
        syncVolumeUI();
        playerSeekIndicatorLeft?.classList.remove('show', 'pulse');
        playerSeekIndicatorRight?.classList.remove('show', 'pulse');
    }

    function syncVolumeUI() {
        const volume = vixPlayer.muted ? 0 : vixPlayer.volume;
        if (playerVolume) {
            playerVolume.value = volume;
            playerVolume.style.setProperty('--volume', `${volume * 100}%`);
        }
        if (playerMute) {
            const label = volume === 0 ? 'Unmute' : 'Mute';
            playerMute.setAttribute('aria-label', label);
            playerMute.title = label;
        }
        if (!playerVolumeIcon) return;
        const speaker = '<path d="M11 5 6 9H3v6h3l5 4V5Z"></path>';
        if (volume === 0) {
            playerVolumeIcon.innerHTML = speaker + '<path d="m16 9 5 5m0-5-5 5"></path>';
        } else if (volume < 0.5) {
            playerVolumeIcon.innerHTML = speaker + '<path d="M15.5 9.5a4 4 0 0 1 0 5"></path>';
        } else {
            playerVolumeIcon.innerHTML = speaker + '<path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 6a8.5 8.5 0 0 1 0 12"></path>';
        }
    }

    function closePlayerModal() {
        playerRequestId++;
        clearTimeout(controlsHideTimer);
        clearTimeout(playerCloseTimer);
        playerModal.classList.remove('show');
        playerModal.setAttribute('aria-hidden', 'true');
        syncBodyOverflow();
		playerCloseTimer = setTimeout(() => {
            playerModal.style.display = 'none';
            playerModal.classList.remove('player-ready');
            stopVixPlayback();
            vixPlayer.style.display = 'none';
            playerLoader.innerHTML = '<div class="player-spinner"></div>';
            playerLoader.style.display = 'flex';
            resetPlayerUI();
		playerCloseTimer = null;
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
    function isHlsServer(server) {
        // Both available servers (vixsrc and vidking) use HLS. This helper is
        // kept for clarity and forward-compatibility if other server types are added.
        return server === 'vixsrc' || server === 'vidking' || server === 'vidlove';
    }

    function toggleVixPlay() {
        if (!isHlsServer(activePlayerServer) || !playerReady) return;
        if (vixPlayer.paused) vixPlayer.play().catch(() => {}); else vixPlayer.pause();
        showControls();
    }

    if (playerPlay) playerPlay.addEventListener('click', toggleVixPlay);
    if (playerCenterPlay) playerCenterPlay.addEventListener('click', toggleVixPlay);
    vixPlayer.addEventListener('click', () => { if (isHlsServer(activePlayerServer) && playerReady) toggleVixPlay(); });
    vixPlayer.addEventListener('dblclick', () => { if (isHlsServer(activePlayerServer) && playerReady) togglePlayerFullscreen(); });
    vixPlayer.addEventListener('play', updatePlayerPlayIcon);
    vixPlayer.addEventListener('pause', updatePlayerPlayIcon);
    vixPlayer.addEventListener('timeupdate', () => {
        const duration = Number.isFinite(vixPlayer.duration) ? vixPlayer.duration : 0;
        if (playerProgress) { const pct = duration ? (vixPlayer.currentTime / duration) * 100 : 0; playerProgress.value = pct; playerProgress.style.setProperty('--progress', `${pct}%`); }
        if (playerTimeCurrent) playerTimeCurrent.textContent = formatPlayerTime(vixPlayer.currentTime);
        if (playerTimeDuration) playerTimeDuration.textContent = formatPlayerTime(duration);
        if (currentPlayerMovie && vixPlayer.currentTime - lastSavedPlaybackSecond >= 5) {
            saveProgress(currentPlayerMovie, currentPlayerSeason, currentPlayerEpisode, vixPlayer.currentTime);
            lastSavedPlaybackSecond = vixPlayer.currentTime;
        }
    });
    vixPlayer.addEventListener('loadedmetadata', () => {
        if (!vixPlayer.__resumeApplied && pendingResumePosition > 5 && Number.isFinite(vixPlayer.duration) && pendingResumePosition < vixPlayer.duration - 10) {
            vixPlayer.__resumeApplied = true;
            vixPlayer.currentTime = pendingResumePosition;
            showToast(`Resuming at ${formatPlayerTime(pendingResumePosition)}`);
        }
        pendingResumePosition = 0;
        if (playerTimeCurrent) playerTimeCurrent.textContent = '0:00';
        if (playerTimeDuration) playerTimeDuration.textContent = formatPlayerTime(vixPlayer.duration);
        updatePlayerPlayIcon();
    });
    vixPlayer.addEventListener('ended', () => {
        updatePlayerPlayIcon();
        if (currentPlayerMovie?.type === 'tv') {
            setTimeout(() => { if (playerModal.classList.contains('show')) playNextEpisode(); }, 500);
        }
    });
    if (playerProgress) playerProgress.addEventListener('input', () => {
        if (!isHlsServer(activePlayerServer) || !Number.isFinite(vixPlayer.duration)) return;
        vixPlayer.currentTime = (Number(playerProgress.value) / 100) * vixPlayer.duration;
        showControls();
    });
    if (playerMute) playerMute.addEventListener('click', () => {
        if (!isHlsServer(activePlayerServer)) return;
        vixPlayer.muted = !vixPlayer.muted;
        syncVolumeUI();
        showControls();
    });

    // ─── Double-tap-to-seek zones (Netflix/YouTube-style) ─────────────────
    // Tapping once on the left/right edge of the video behaves just like
    // tapping the video itself (toggle play/pause). Tapping twice quickly in
    // the same zone instead seeks ±10s and shows a brief ripple indicator.
    // Consecutive double-taps within the zone accumulate ("20 seconds",
    // "30 seconds"...) before resetting, matching the real apps.
    function setupSeekZone(zoneEl, indicatorEl, amountEl, direction) {
        if (!zoneEl) return;
        const SINGLE_TAP_DELAY = 260;
        const ACCUM_RESET_DELAY = 700;
        let tapCount = 0;
        let singleTapTimer = null;
        let accumSeconds = 0;
        let accumResetTimer = null;

        function doSeek() {
            if (!isHlsServer(activePlayerServer) || !playerReady) return;
            if (direction === 'back') {
                vixPlayer.currentTime = Math.max(0, vixPlayer.currentTime - 10);
            } else if (Number.isFinite(vixPlayer.duration)) {
                vixPlayer.currentTime = Math.min(vixPlayer.duration, vixPlayer.currentTime + 10);
            }
            accumSeconds += 10;
            amountEl.textContent = `${accumSeconds} second${accumSeconds === 1 ? '' : 's'}`;
            indicatorEl.classList.remove('pulse');
            void indicatorEl.offsetWidth; // restart the pulse animation
            indicatorEl.classList.add('show', 'pulse');
            clearTimeout(accumResetTimer);
            accumResetTimer = setTimeout(() => {
                indicatorEl.classList.remove('show');
                accumSeconds = 0;
            }, ACCUM_RESET_DELAY);
            showControls();
        }

        zoneEl.addEventListener('click', () => {
            if (!isHlsServer(activePlayerServer) || !playerReady) return;
            tapCount++;
            if (tapCount === 1) {
                singleTapTimer = setTimeout(() => {
                    tapCount = 0;
                    toggleVixPlay();
                }, SINGLE_TAP_DELAY);
            } else {
                clearTimeout(singleTapTimer);
                tapCount = 0;
                doSeek();
            }
        });
    }
    setupSeekZone(playerSeekZoneLeft, playerSeekIndicatorLeft, playerSeekAmountLeft, 'back');
    setupSeekZone(playerSeekZoneRight, playerSeekIndicatorRight, playerSeekAmountRight, 'forward');

    if (playerVolume) playerVolume.addEventListener('input', () => {
        if (!isHlsServer(activePlayerServer)) return;
        vixPlayer.volume = Number(playerVolume.value);
        vixPlayer.muted = vixPlayer.volume === 0;
        syncVolumeUI();
        showControls();
    });
    vixPlayer.addEventListener('volumechange', syncVolumeUI);
    function syncFullscreenIcon() {
        if (!playerFullscreen) return;
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (isFullscreen) {
            playerFullscreen.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="8 3 8 8 3 8"></polyline><polyline points="16 3 16 8 21 8"></polyline><polyline points="8 21 8 16 3 16"></polyline><polyline points="16 21 16 16 21 16"></polyline></svg>';
        } else {
            playerFullscreen.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="8 3 3 3 3 8"></polyline><polyline points="16 3 21 3 21 8"></polyline><polyline points="8 21 3 21 3 16"></polyline><polyline points="21 16 21 21 16 21"></polyline></svg>';
        }
    }
    document.addEventListener('fullscreenchange', syncFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', syncFullscreenIcon);
    document.addEventListener('mozfullscreenchange', syncFullscreenIcon);
    document.addEventListener('MSFullscreenChange', syncFullscreenIcon);

    // Attempts to request fullscreen on `el` using whichever vendor-prefixed
    // API is available. Returns the resulting Promise (if any) or null if the
    // element has no fullscreen API at all.
    function requestFullscreenOn(el) {
        if (!el) return null;
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); return null; }
        if (el.mozRequestFullScreen) { el.mozRequestFullScreen(); return null; }
        if (el.msRequestFullscreen) { el.msRequestFullscreen(); return null; }
        return undefined; // signals "no API available on this element"
    }

    function togglePlayerFullscreen() {
        const target = playerModal;
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

        try {
            if (!isFullscreen) {
                // Some browsers (older mobile Safari, some in-app/webview
                // browsers, or pages embedded in an iframe without
                // `allow="fullscreen"`) report `fullscreenEnabled === false`.
                // In that case requesting fullscreen on any element will
                // always fail, so go straight to the one thing that *can*
                // still work on iOS: native fullscreen on the <video> itself.
                if (document.fullscreenEnabled === false && !document.webkitFullscreenEnabled) {
                    if (vixPlayer.webkitEnterFullscreen) {
                        vixPlayer.webkitEnterFullscreen();
                    } else {
                        showToast('Fullscreen is disabled in this browser/frame');
                    }
                    showControls();
                    return;
                }

                const result = requestFullscreenOn(target);
                if (result && result.catch) {
                    // Container fullscreen was rejected (permissions policy,
                    // user gesture lost, etc). Fall back to requesting
                    // fullscreen on the <video> element directly, which is
                    // more broadly supported.
                    result.catch(err => {
                        console.warn('Fullscreen failed on player container, trying video element:', err);
                        const videoResult = requestFullscreenOn(vixPlayer);
                        if (videoResult && videoResult.catch) {
                            videoResult.catch(err2 => {
                                console.warn('Fullscreen failed on video element too:', err2);
                                if (vixPlayer.webkitEnterFullscreen) {
                                    vixPlayer.webkitEnterFullscreen();
                                } else {
                                    showToast('Fullscreen blocked by browser (permissions)');
                                }
                            });
                        } else if (videoResult === undefined && vixPlayer.webkitEnterFullscreen) {
                            vixPlayer.webkitEnterFullscreen();
                        }
                    });
                } else if (result === undefined) {
                    // Container had no fullscreen API at all — try the video
                    // element before giving up.
                    const videoResult = requestFullscreenOn(vixPlayer);
                    if (videoResult === undefined) {
                        if (vixPlayer.webkitEnterFullscreen) {
                            vixPlayer.webkitEnterFullscreen();
                        } else {
                            showToast('Fullscreen not supported on this device');
                        }
                    }
                }
            } else {
                if (document.exitFullscreen) {
                    const p = document.exitFullscreen();
                    if (p && p.catch) p.catch(() => {});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        } catch (err) {
            console.warn('Fullscreen error:', err);
            showToast('Fullscreen error: ' + err.message);
        }
        showControls();
    }

    if (playerFullscreen) playerFullscreen.addEventListener('click', () => {
        togglePlayerFullscreen();
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
        const playerOpen = playerModal.classList.contains('show');
        if (e.key === 'Escape') {
            if (playerEpPanel.classList.contains('show')) { playerEpPanel.classList.remove('show'); playerEpListBtn.setAttribute('aria-expanded', 'false'); return; }
            if (playerOpen) { closePlayerModal(); return; }
            if (detailModal.classList.contains('show')) { closeDetailModal(); return; }
            if (searchOverlay.classList.contains('show')) { closeSearch(); return; }
        }
        if (playerOpen) {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
                e.preventDefault();
                toggleVixPlay();
                return;
            }
            if (e.key === 'ArrowLeft') { e.preventDefault(); vixPlayer.currentTime = Math.max(0, vixPlayer.currentTime - 10); showControls(); return; }
            if (e.key === 'ArrowRight' && Number.isFinite(vixPlayer.duration)) { e.preventDefault(); vixPlayer.currentTime = Math.min(vixPlayer.duration, vixPlayer.currentTime + 10); showControls(); return; }
            if (e.key === 'm' || e.key === 'M') { e.preventDefault(); vixPlayer.muted = !vixPlayer.muted; showControls(); return; }
            if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                togglePlayerFullscreen();
            }
            return;
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
