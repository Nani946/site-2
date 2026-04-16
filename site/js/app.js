(function () {
  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.from((r || document).querySelectorAll(s)); }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (e) {
      return fallback;
    }
  }

  var state = {
    lang: localStorage.getItem('ha_lang') || 'ru',
    favorites: readJson('ha_favorites', []),
    user: readJson('ha_user', null)
  };

  function saveState() {
    localStorage.setItem('ha_lang', state.lang);
    localStorage.setItem('ha_favorites', JSON.stringify(state.favorites));
    if (state.user) localStorage.setItem('ha_user', JSON.stringify(state.user));
    else localStorage.removeItem('ha_user');
  }

  function t(key) {
    return (SITE_CONFIG.i18n[state.lang] && SITE_CONFIG.i18n[state.lang][key]) || key;
  }

  function pageText(key) {
    return SITE_CONFIG.pageText[key + (state.lang === 'ru' ? 'Ru' : 'En')];
  }

  function statLabel(item) { return state.lang === 'ru' ? item.labelRu : item.labelEn; }
  function moodList(movie) { return state.lang === 'ru' ? movie.moodsRu : movie.moodsEn; }
  function genreLabel(movie) { return state.lang === 'ru' ? movie.genreLabelRu : movie.genreLabelEn; }
  function countryLabel(movie) { return state.lang === 'ru' ? movie.countryRu : movie.countryEn; }
  function titleLabel(movie) { return state.lang === 'ru' ? movie.titleRu : movie.title; }
  function cardText(movie) { return state.lang === 'ru' ? movie.cardTextRu : movie.cardTextEn; }
  function pageMovieText(movie) { return state.lang === 'ru' ? movie.pageTextRu : movie.pageTextEn; }
  function reviewRole(item) { return state.lang === 'ru' ? item.roleRu : item.roleEn; }
  function reviewText(item) { return state.lang === 'ru' ? item.textRu : item.textEn; }
  function collectionTitle(item) { return state.lang === 'ru' ? item.titleRu : item.titleEn; }
  function collectionText(item) { return state.lang === 'ru' ? item.textRu : item.textEn; }
  function faqQ(item) { return state.lang === 'ru' ? item.qRu : item.qEn; }
  function faqA(item) { return state.lang === 'ru' ? item.aRu : item.aEn; }
  function aboutLead() { return state.lang === 'ru' ? SITE_CONFIG.about.leadRu : SITE_CONFIG.about.leadEn; }
  function aboutText() { return state.lang === 'ru' ? SITE_CONFIG.about.textRu : SITE_CONFIG.about.textEn; }
  function currentMin() { return state.lang === 'ru' ? 'мин' : 'min'; }

  function getMovie(id) {
    return MOVIE_TABLE.find(function (movie) { return movie.id === Number(id); });
  }

  function getMovies(ids) {
    return ids.map(getMovie).filter(Boolean);
  }

  function isFavorite(id) {
    return state.favorites.includes(id);
  }

  function toggleFavorite(id) {
    if (isFavorite(id)) state.favorites = state.favorites.filter(function (item) { return item !== id; });
    else state.favorites.push(id);
    saveState();
  }

  function setLang(lang) {
    state.lang = lang;
    saveState();
    applyDocumentMeta();
    renderHeader();
    renderFooter();
    renderHome();
    renderCatalog();
    renderMoviePage();
    renderCollection();
    renderFavorites();
    renderReviews();
    renderTop();
    renderNew();
    renderAbout();
    renderFaq();
    renderAuth();
  }

  function loginUser(payload) {
    state.user = payload;
    saveState();
    updateAuthHeader();
  }

  function logoutUser() {
    state.user = null;
    saveState();
    renderHeader();
    renderAuth();
  }

  function headerLinks() {
    return [
      ['index.html', t('home')],
      ['catalog.html', t('catalog')],
      ['top.html', t('top')],
      ['new.html', t('newItems')],
      ['collection.html', t('mood')],
      ['reviews.html', t('reviews')],
      ['about.html', t('about')]
    ];
  }

  function applyDocumentMeta() {
    document.documentElement.lang = state.lang;
    var path = location.pathname.split('/').pop() || 'index.html';
    var map = {
      'index.html': 'pageIndexTitle',
      'catalog.html': 'pageCatalogTitle',
      'collection.html': 'pageCollectionTitle',
      'favorites.html': 'pageFavoritesTitle',
      'reviews.html': 'pageReviewsTitle',
      'top.html': 'pageTopTitle',
      'new.html': 'pageNewTitle',
      'about.html': 'pageAboutTitle',
      'faq.html': 'pageFaqTitle',
      'auth.html': 'pageAuthTitle',
      'movie.html': 'pageMovieTitle'
    };
    document.title = t(map[path] || 'pageIndexTitle');
  }

  function updateAuthHeader() {
    var authLink = q('#authHeaderLink');
    if (!authLink) return;
    if (state.user) {
      authLink.textContent = state.user.name;
      authLink.href = 'auth.html';
      authLink.title = state.user.email;
    } else {
      authLink.textContent = t('signin');
      authLink.href = 'auth.html';
      authLink.title = t('signin');
    }
    var count = q('#favoritesCountBtn');
    if (count) count.textContent = '♡ ' + state.favorites.length;
  }

  function renderHeader() {
    var path = location.pathname.split('/').pop() || 'index.html';
    var html = '<header class="site-header"><div class="container header-inner">' +
      '<a class="brand" href="index.html"><div class="brand-mark">☠</div><div class="brand-text"><div class="brand-title">' + SITE_CONFIG.brand.title + '</div><div class="brand-sub">' + SITE_CONFIG.brand.sub + '</div></div></a>' +
      '<nav class="main-nav">' + headerLinks().map(function (item) {
        return '<a href="' + item[0] + '" class="' + (path === item[0] ? 'active' : '') + '"><span>' + item[1] + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="header-tools">' +
      '<button class="lang-btn ' + (state.lang === 'en' ? 'active' : '') + '" data-lang="en">EN</button>' +
      '<button class="lang-btn ' + (state.lang === 'ru' ? 'active' : '') + '" data-lang="ru">RU</button>' +
      '<a class="header-link auth-link ' + (path === 'auth.html' ? 'active' : '') + '" id="authHeaderLink" href="auth.html"></a>' +
      '<a class="header-link favorites-link" href="favorites.html" id="favoritesCountBtn">♡ ' + state.favorites.length + '</a>' +
      '</div></div></header>';
    q('#header').innerHTML = html;
    qa('.lang-btn').forEach(function (btn) {
      btn.onclick = function () { setLang(btn.dataset.lang); };
    });
    updateAuthHeader();
  }

  function renderFooter() {
    var c = SITE_CONFIG.contacts;
    var footerText = state.lang === 'ru' ? 'Каталог хоррора, мистики и триллеров' : 'Catalog of horror, supernatural cinema and thrillers';
    q('#footer').innerHTML = '<footer class="footer"><div class="container footer-inner"><div class="footer-top"><div><div class="brand-title">Horror Vault</div><div class="footer-copy">' + footerText + '</div></div><div class="footer-links"><a href="catalog.html">' + t('catalog') + '</a><a href="faq.html">FAQ</a><a href="about.html">' + t('about') + '</a></div></div><div class="footer-copy">' + c.city + ' • ' + c.address + ' • ' + c.email + ' • ' + c.telegram + '</div></div></footer>';
  }

  function movieMeta(movie) {
    return movie.year + ' • ' + countryLabel(movie) + ' • ' + movie.duration + ' ' + currentMin() + ' • ' + genreLabel(movie) + ' • ' + movie.rating;
  }

  function cardTemplate(movie, trailing) {
    return '<article class="movie-card">' +
      '<img class="movie-poster" src="' + movie.poster + '" alt="' + titleLabel(movie) + '">' +
      '<div class="movie-body">' +
      '<div class="card-sub">' + movie.title + '</div>' +
      '<h3 class="poster-title">' + titleLabel(movie) + '</h3>' +
      '<div class="card-meta">' + movieMeta(movie) + '</div>' +
      '<p class="card-text">' + cardText(movie) + '</p>' +
      '<div class="meta-line">' + moodList(movie).map(function (m) { return '<span class="tag">' + m + '</span>'; }).join('') + '</div>' +
      '<div class="movie-actions" style="margin-top:14px;">' +
      '<a class="card-button" href="movie.html?id=' + movie.id + '">' + t('openCard') + '</a>' +
      '<button class="card-button fav-toggle" data-id="' + movie.id + '">' + (isFavorite(movie.id) ? t('savedState') : t('save')) + '</button>' +
      (trailing || '') +
      '</div></div></article>';
  }

  function bindFavoriteButtons(root) {
    qa('.fav-toggle', root).forEach(function (button) {
      button.onclick = function () {
        toggleFavorite(Number(button.dataset.id));
        refreshPageParts();
      };
    });
    qa('.remove-favorite', root).forEach(function (button) {
      button.onclick = function () {
        state.favorites = state.favorites.filter(function (item) { return item !== Number(button.dataset.id); });
        saveState();
        refreshPageParts();
      };
    });
  }

  function refreshPageParts() {
    applyDocumentMeta();
    updateAuthHeader();
    renderCatalog();
    renderHome();
    renderCollection();
    renderFavorites();
    renderTop();
    renderNew();
    renderMoviePage();
    renderReviews();
    renderAbout();
    renderFaq();
    renderAuth();
  }

  function renderHome() {
    if (!q('#homePicks')) return;
    q('#heroNote').textContent = pageText('homeNote');
    q('#heroTitle').textContent = pageText('homeTitle');
    q('#heroText').textContent = pageText('homeText');
    q('#homeCatalogBtn').textContent = t('openCatalog');
    q('#homeCollectionBtn').textContent = t('openCollection');
    q('#featuredTitle').textContent = t('featured');
    q('#featuredText').textContent = state.lang === 'ru' ? 'Подборка фильмов, с которых удобно начать вечерний просмотр.' : 'A set of films that works well as a starting point for tonight.';
    q('#notesTitle').textContent = t('notes');
    q('#notesText').textContent = state.lang === 'ru' ? 'Короткие ответы на частые вопросы о подборках, списках и поиске внутри сервиса.' : 'Quick answers about lists, mood sections and navigating the vault.';
    q('#homeStats').innerHTML = SITE_CONFIG.stats.map(function (item) {
      return '<article class="stat-card"><h3>' + item.value + '</h3><p>' + statLabel(item) + '</p></article>';
    }).join('');
    var panels = SITE_CONFIG.homePanels[state.lang];
    qa('[data-home-panel]').forEach(function (panel, index) {
      var data = panels[index];
      if (!data) return;
      panel.innerHTML = '<h3>' + data.title + '</h3><ul>' + data.items.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>';
    });
    q('#homePicks').innerHTML = getMovies(TOP_TABLE.slice(0, 3)).map(function (movie) { return cardTemplate(movie); }).join('');
    q('#homeFaq').innerHTML = SITE_CONFIG.faq.map(function (item) {
      return '<article class="faq-item"><h3>' + faqQ(item) + '</h3><p>' + faqA(item) + '</p></article>';
    }).join('');
    bindFavoriteButtons(document);
  }

  function renderCatalog() {
    var grid = q('#catalogGrid');
    if (!grid) return;
    q('#catalogTitle').textContent = t('catalogTitle');
    q('#catalogLead').textContent = pageText('catalogLead');
    var search = q('#searchInput');
    var genre = q('#genreSelect');
    var sort = q('#sortSelect');
    search.placeholder = t('searchPlaceholder');
    genre.innerHTML = '<option value="all">' + t('allGenres') + '</option><option value="psychological">' + t('genrePsychological') + '</option><option value="thriller">' + t('genreThriller') + '</option><option value="supernatural">' + t('genreSupernatural') + '</option>';
    sort.innerHTML = '<option value="rating">' + t('sortRating') + '</option><option value="year">' + t('sortYear') + '</option><option value="title">' + t('sortTitle') + '</option>';

    function draw() {
      var list = MOVIE_TABLE.slice();
      var value = search.value.trim().toLowerCase();
      var genreValue = genre.value;
      var sortValue = sort.value;
      if (value) {
        list = list.filter(function (movie) {
          return [movie.title, movie.titleRu, movie.cardTextEn, movie.cardTextRu, movie.pageTextEn, movie.pageTextRu].join(' ').toLowerCase().includes(value);
        });
      }
      if (genreValue !== 'all') list = list.filter(function (movie) { return movie.genre === genreValue; });
      if (sortValue === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
      if (sortValue === 'year') list.sort(function (a, b) { return b.year - a.year; });
      if (sortValue === 'title') list.sort(function (a, b) { return titleLabel(a).localeCompare(titleLabel(b)); });
      grid.innerHTML = list.length ? list.map(function (movie) { return cardTemplate(movie); }).join('') : '<div class="empty-box"><h3 class="brand-title">' + pageText('empty').split('.')[0] + '</h3><p>' + pageText('empty') + '</p></div>';
      bindFavoriteButtons(document);
    }

    search.oninput = draw;
    genre.onchange = draw;
    sort.onchange = draw;
    draw();
  }

  function renderMoviePage() {
    var holder = q('#moviePage');
    if (!holder) return;
    var params = new URLSearchParams(location.search);
    var movie = getMovie(params.get('id') || 1);
    if (!movie) return;
    document.title = titleLabel(movie) + ' — Horror Vault';
    var related = MOVIE_TABLE.filter(function (item) {
      return item.id !== movie.id && (item.genre === movie.genre || moodList(item).some(function (m) { return moodList(movie).includes(m); }));
    }).slice(0, 3);
    holder.innerHTML = '<section class="banner"><div class="container"><div class="banner-box movie-banner" style="background:linear-gradient(90deg, rgba(0,0,0,0.94), rgba(0,0,0,0.72)), url(&quot;' + movie.backdrop + '&quot;) center/cover;"><div class="card-sub">' + movie.title + '</div><h1 class="banner-title">' + titleLabel(movie) + '</h1><p class="banner-text">' + pageMovieText(movie) + '</p></div></div></section>' +
      '<section class="page-section"><div class="container detail-layout"><img class="detail-poster" src="' + movie.poster + '" alt="' + titleLabel(movie) + '"><div class="detail-grid"><div class="detail-box"><h3>' + t('overview') + '</h3><p class="movie-description">' + pageMovieText(movie) + '</p><div class="meta-line">' + moodList(movie).map(function (m) { return '<span class="tag">' + m + '</span>'; }).join('') + '</div><div class="movie-actions" style="margin-top:18px;"><button class="card-button fav-toggle" data-id="' + movie.id + '">' + (isFavorite(movie.id) ? t('savedState') : t('save')) + '</button><a class="card-button" href="catalog.html">' + t('catalog') + '</a></div></div><div class="detail-box"><h3>' + t('details') + '</h3><div class="metric-box"><div class="metric"><div class="metric-label">' + t('year') + '</div><div class="metric-value">' + movie.year + '</div></div><div class="metric"><div class="metric-label">' + t('rating') + '</div><div class="metric-value">' + movie.rating + '</div></div><div class="metric"><div class="metric-label">' + t('duration') + '</div><div class="metric-value">' + movie.duration + ' ' + currentMin() + '</div></div><div class="metric"><div class="metric-label">' + t('country') + '</div><div class="metric-value">' + countryLabel(movie) + '</div></div></div><ul class="detail-list"><li>' + t('genre') + ': ' + genreLabel(movie) + '</li><li>' + t('country') + ': ' + countryLabel(movie) + '</li><li>' + t('rating') + ': ' + movie.rating + '</li><li>' + t('cardId') + ': ' + movie.id + '</li></ul></div></div></div></section>' +
      '<section class="page-section"><div class="container"><div class="page-head"><h2 class="page-title">' + t('related') + '</h2></div><div class="catalog-grid">' + related.map(function (item) { return cardTemplate(item); }).join('') + '</div></div></section>';
    bindFavoriteButtons(document);
  }

  function renderCollection() {
    var holder = q('#collectionGrid');
    if (!holder) return;
    q('#collectionTitle').textContent = t('collectionTitle');
    q('#collectionLead').textContent = pageText('collectionLead');
    holder.innerHTML = COLLECTION_TABLE.map(function (collection) {
      return '<section class="section-box"><h3>' + collectionTitle(collection) + '</h3><p class="info-text">' + collectionText(collection) + '</p><div class="catalog-grid" style="margin-top:16px;">' + getMovies(collection.items).slice(0, 3).map(function (movie) { return cardTemplate(movie); }).join('') + '</div></section>';
    }).join('');
    bindFavoriteButtons(document);
  }

  function renderFavorites() {
    var holder = q('#favoritesGrid');
    if (!holder) return;
    q('#favoritesTitle').textContent = t('favoritesTitle');
    q('#favoritesLead').textContent = pageText('favoritesLead');
    var list = getMovies(state.favorites);
    holder.innerHTML = list.length ? list.map(function (movie) { return cardTemplate(movie, '<button class="remove-btn remove-favorite" data-id="' + movie.id + '">' + t('remove') + '</button>'); }).join('') : '<div class="empty-box"><h3 class="brand-title">' + t('favoritesEmptyTitle') + '</h3><p>' + t('favoritesEmptyText') + '</p></div>';
    bindFavoriteButtons(document);
  }

  function renderReviews() {
    var holder = q('#reviewGrid');
    if (!holder) return;
    q('#reviewsTitle').textContent = t('reviewsTitle');
    q('#reviewsLead').textContent = pageText('reviewsLead');
    holder.innerHTML = REVIEW_TABLE.map(function (review) {
      var movie = getMovie(review.movieId);
      return '<article class="review-card"><div class="review-meta">' + reviewRole(review) + ' • ' + review.score + '</div><h3>' + titleLabel(movie) + '</h3><p>' + reviewText(review) + '</p><div class="note-line">' + review.author + '</div></article>';
    }).join('');
  }

  function renderTop() {
    var holder = q('#topGrid');
    if (!holder) return;
    if (q('#topTitle')) q('#topTitle').textContent = t('top');
    if (q('#topLead')) q('#topLead').textContent = pageText('topLead');
    holder.innerHTML = getMovies(TOP_TABLE).map(function (movie, index) {
      return cardTemplate(movie, '<span class="tag">#' + (index + 1) + '</span>');
    }).join('');
    bindFavoriteButtons(document);
  }

  function renderNew() {
    var holder = q('#newGrid');
    if (!holder) return;
    if (q('#newTitle')) q('#newTitle').textContent = t('newItems');
    if (q('#newLead')) q('#newLead').textContent = pageText('newLead');
    holder.innerHTML = getMovies(NEW_TABLE).map(function (movie) { return cardTemplate(movie); }).join('');
    bindFavoriteButtons(document);
  }

  function renderAbout() {
    var holder = q('#aboutBlock');
    if (!holder) return;
    q('#aboutTitle').textContent = t('aboutTitle');
    q('#aboutLead').textContent = pageText('aboutLead');
    var returnTitle = state.lang === 'ru' ? 'Почему сюда возвращаются' : 'Why people come back';
    var returnItems = state.lang === 'ru'
      ? ['быстрый переход между каталогом, топом и новинками', 'личный список сохранённых фильмов', 'подборки по настроению для разного типа просмотра', 'отзывы зрителей и редакционные заметки']
      : ['fast jump between the catalog, top list and weekly additions', 'a personal saved list that stays close at hand', 'mood-based selections for different kinds of nights', 'viewer reactions alongside editorial notes'];
    holder.innerHTML = '<section class="page-section"><div class="container about-grid"><div class="panel-box"><h3>' + t('aboutTitle') + '</h3><p class="info-text">' + aboutLead() + '</p><p class="info-text">' + aboutText() + '</p></div><div class="panel-box"><h3>' + returnTitle + '</h3><ul class="config-list">' + returnItems.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul></div></div></section><section class="page-section"><div class="container"><div class="page-head"><h2 class="page-title">FAQ</h2></div><div class="faq-grid">' + SITE_CONFIG.faq.map(function (item) { return '<article class="faq-item"><h3>' + faqQ(item) + '</h3><p>' + faqA(item) + '</p></article>'; }).join('') + '</div></div></section>';
  }

  function renderFaq() {
    var holder = q('#faqGrid');
    if (!holder) return;
    q('#faqTitle').textContent = 'FAQ';
    q('#faqLead').textContent = state.lang === 'ru' ? 'Короткие ответы о личном списке, подборках, топе и способах выбирать фильмы внутри Vault.' : 'Quick answers about saved lists, mood sections, rankings and choosing films inside the vault.';
    holder.innerHTML = SITE_CONFIG.faq.map(function (item) { return '<article class="faq-item"><h3>' + faqQ(item) + '</h3><p>' + faqA(item) + '</p></article>'; }).join('');
  }

  function renderAuth() {
    var holder = q('#authPanel');
    if (!holder) return;
    q('#authTitle').textContent = t('authTitle');
    q('#authLead').textContent = pageText('authLead');
    var left = '';
    if (state.user) {
      left = '<div class="auth-box"><h3 class="auth-title">' + t('accountTitle') + '</h3><div class="note-line">' + t('accountReady') + ': ' + state.user.name + '</div><div class="detail-list"><div>' + t('email') + ': ' + state.user.email + '</div><div>' + t('languageSaved') + ': ' + state.lang.toUpperCase() + '</div><div>' + t('savedCount') + ': ' + state.favorites.length + '</div></div><div class="movie-actions" style="margin-top:18px;"><button class="primary-btn" id="logoutBtn">' + t('signout') + '</button><a class="secondary-btn" href="favorites.html">' + t('saved') + '</a></div></div>';
    } else {
      left = '<div class="auth-box"><div class="tab-row"><button class="tab-link active" data-tab="login">' + t('signin') + '</button><button class="tab-link" data-tab="register">' + t('createAccount') + '</button></div><form class="form-box" id="loginForm"><input type="email" id="loginEmail" placeholder="' + t('email') + '" required><input type="password" id="loginPassword" placeholder="' + t('password') + '" required><button class="primary-btn" type="submit">' + t('enterArchive') + '</button></form><form class="form-box hidden" id="registerForm"><input type="text" id="registerName" placeholder="' + t('name') + '" required><input type="email" id="registerEmail" placeholder="' + t('email') + '" required><input type="password" id="registerPassword" placeholder="' + t('password') + '" required><button class="primary-btn" type="submit">' + t('createAccount') + '</button></form></div>';
    }
    holder.innerHTML = left;
    q('#authInfo').innerHTML = '<div class="auth-box"><h3>' + t('personalAccess') + '</h3><p class="auth-text">' + SITE_CONFIG.authText[state.lang] + '</p><div class="note-line">' + t('guestHint') + '</div></div>';
    bindAuthEvents();
  }

  function bindAuthEvents() {
    var loginForm = q('#loginForm');
    var registerForm = q('#registerForm');
    qa('[data-tab]').forEach(function (btn) {
      btn.onclick = function () {
        qa('[data-tab]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var login = q('#loginForm');
        var reg = q('#registerForm');
        if (btn.dataset.tab === 'login') {
          login.classList.remove('hidden');
          reg.classList.add('hidden');
        } else {
          reg.classList.remove('hidden');
          login.classList.add('hidden');
        }
      };
    });
    if (loginForm) {
      loginForm.onsubmit = function (e) {
        e.preventDefault();
        var email = q('#loginEmail').value.trim();
        var pass = q('#loginPassword').value.trim();
        if (!email || !pass) return;
        var stored = readJson('ha_registered_user', null);
        if (stored && stored.email === email) loginUser(stored);
        else loginUser({ name: email.split('@')[0], email: email });
        applyDocumentMeta();
        renderHeader();
        renderAuth();
      };
    }
    if (registerForm) {
      registerForm.onsubmit = function (e) {
        e.preventDefault();
        var user = { name: q('#registerName').value.trim(), email: q('#registerEmail').value.trim() };
        if (!user.name || !user.email) return;
        localStorage.setItem('ha_registered_user', JSON.stringify(user));
        loginUser(user);
        applyDocumentMeta();
        renderHeader();
        renderAuth();
      };
    }
    var logout = q('#logoutBtn');
    if (logout) logout.onclick = logoutUser;
  }

  function boot() {
    applyDocumentMeta();
    renderHeader();
    renderFooter();
    renderHome();
    renderCatalog();
    renderMoviePage();
    renderCollection();
    renderFavorites();
    renderReviews();
    renderTop();
    renderNew();
    renderAbout();
    renderFaq();
    renderAuth();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
