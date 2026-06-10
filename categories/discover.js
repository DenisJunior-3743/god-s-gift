/**
 * discover.js
 * ============================================================
 * God's Gift Safaris — Discover Page Logic
 *
 * Handles all interactivity on discover.html:
 *
 *  1. Load all attractions from data.json
 *  2. Render category filter buttons from data.json categories
 *  3. Filter cards by category when a button is clicked
 *  4. Live search — filter by name as user types
 *  5. Sort — by rating or name
 *  6. URL sync — reads ?category=parks from the URL on load
 *     (so sharing discover.html?category=wildlife works)
 *  7. Animated card transitions using CSS + jQuery
 *
 * State management:
 *   All filter/search/sort state is stored in the `state` object.
 *   Every change calls renderCards() which re-renders the grid.
 * ============================================================
 */


/* ----------------------------------------------------------
   MODULE STATE
   Single source of truth for the current filter/search/sort.
   ---------------------------------------------------------- */
const state = {
  allAttractions: [],   // All attractions loaded from JSON (never mutated)
  activeCategory: 'all',
  searchQuery:    '',
  sortBy:         'default',
};

function optimizeImage(url, width = 900) {
  if (!window.CloudinaryMedia) return url;
  return window.CloudinaryMedia.getOptimizedUrl(url, {
    width,
    crop: 'fill',
    gravity: 'auto',
  });
}

/* ----------------------------------------------------------
   CAPTION TICKER STATE
   Cycles through category names on mobile, highlighting each
   filter button and showing its label in the caption bar.
   ---------------------------------------------------------- */
const ticker = {
  timer:       null,
  resumeTimer: null,
  paused:      false,
  idx:         0,
  cats:        [],
};


/* ----------------------------------------------------------
   FILTER LOGIC
   Pure function: takes attractions array + current state,
   returns the filtered & sorted subset to display.
   ---------------------------------------------------------- */
function getFilteredAttractions() {
  let results = [...state.allAttractions];

  // 1. Filter by category
  if (state.activeCategory !== 'all') {
    results = results.filter(a =>
      a.category.includes(state.activeCategory)
    );
  }

  // 2. Filter by search query (case-insensitive, matches name, tagline, region)
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.region.toLowerCase().includes(q) ||
      a.shortDesc.toLowerCase().includes(q)
    );
  }

  // 3. Sort
  if (state.sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (state.sortBy === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: highest rated first
    results.sort((a, b) => b.rating - a.rating);
  }

  return results;
}


/* ----------------------------------------------------------
   RENDER CARDS
   Main render function. Called every time any filter changes.
   Animates out old cards, replaces with new ones, animates in.
   ---------------------------------------------------------- */
function renderCards() {
  const grid      = document.getElementById('discover-grid');
  const emptyEl   = document.getElementById('empty-state');
  const countEl   = document.getElementById('results-count');
  if (!grid) return;

  const filtered = getFilteredAttractions();

  // Update results count label
  if (countEl) {
    const total = state.allAttractions.length;
    countEl.innerHTML = filtered.length === total
      ? `Showing all <strong>${total}</strong> destinations`
      : `Showing <strong>${filtered.length}</strong> of ${total} destinations`;
  }

  // Show/hide empty state
  if (emptyEl) {
    emptyEl.style.display = filtered.length === 0 ? 'block' : 'none';
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    return;
  }

  // Animate out → replace content → animate in
  $(grid).fadeOut(200, function() {
    // Build all card HTML
    grid.innerHTML = filtered.map((attraction, i) =>
      buildDiscoverCard(attraction, i)
    ).join('');

    $(grid).fadeIn(300);

    // Refresh AOS for newly injected elements
    if (typeof AOS !== 'undefined') AOS.refresh();

    // Re-apply card tilt to new cards
    if (typeof initCardTilt === 'function') initCardTilt();
  });
}


/* ----------------------------------------------------------
   BUILD DISCOVER CARD
   Similar to main.js buildAttractionCard but with more
   detail shown (best time, highlights count).
   ---------------------------------------------------------- */
function buildDiscoverCard(attraction, index) {
  const delay = (index % 3) * 100; // Stagger within each row of 3

  return `
    <a
      href="attraction.html?id=${attraction.id}"
      class="attraction-card"
      data-aos="fade-up"
      data-aos-delay="${delay}"
      data-id="${attraction.id}"
      data-category="${attraction.category.join(',')}"
      aria-label="View details for ${attraction.name}"
    >
      <!-- Image -->
      <div class="card-img-wrap">
        <img
          src="${optimizeImage(attraction.heroImage || attraction.images[0], 1000)}"
          alt="${attraction.name}"
          loading="lazy"
          decoding="async"
          onerror="this.src='assets/logo/logo.png'"
        >
        <!-- Category badge -->
        <div class="card-category-badge">
          <span class="badge badge-green">
            ${attraction.category[0].toUpperCase()}
          </span>
        </div>
        <div class="card-img-overlay"></div>
      </div>

      <!-- Body -->
      <div class="card-body">
        <div class="card-tagline">${attraction.tagline}</div>
        <h3 class="card-title">${attraction.name}</h3>
        <p class="card-desc">${attraction.shortDesc}</p>

        <!-- Meta row -->
        <div class="card-meta">
          <div class="card-meta-item">
            <i class="fas fa-map-marker-alt"></i>
            ${attraction.region}
          </div>
          <div class="card-meta-item">
            <i class="fas fa-clock"></i>
            ${attraction.duration}
          </div>
        </div>

        <!-- Best time -->
        <div style="
          display:flex;align-items:center;gap:0.5rem;
          font-size:0.75rem;color:var(--color-text-light);
          font-family:var(--font-accent);margin-bottom:1rem;
        ">
          <i class="fas fa-sun" style="color:var(--color-accent);"></i>
          Best: ${attraction.bestTime}
        </div>

        <!-- Card footer -->
        <div class="card-footer">
          <span class="card-price">${attraction.price}</span>
          <span class="card-cta">
            Explore <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>

    </a>
  `;
}


/* ----------------------------------------------------------
   RENDER FILTER BUTTONS
   Builds filter buttons from data.json categories array and
   injects them into #filter-wrap.
   Reads the active category from URL or state.
   ---------------------------------------------------------- */
function renderFilterButtons(categories) {
  const wrap = document.getElementById('filter-wrap');
  if (!wrap) return;

  wrap.innerHTML = categories.map(cat => `
    <button
      class="filter-btn ${cat.id === state.activeCategory ? 'active' : ''}"
      data-category="${cat.id}"
      aria-pressed="${cat.id === state.activeCategory}"
      aria-label="${cat.label}"
    >
      <span class="filter-icon"><i class="${cat.icon}"></i></span>
      <span class="filter-label">${cat.label}</span>
    </button>
  `).join('');

  // Wire up click handlers on each filter button
  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');

      // Update active state visually
      wrap.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active', 'filter-btn--preview');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Update state and re-render
      state.activeCategory = category;
      renderCards();

      // Show this category in the caption bar immediately, pause ticker 3 s
      showCaptionFor(category);
      pauseTickerThen(3000);

      // Update URL without reloading page (for shareability)
      const url = new URL(window.location.href);
      if (category === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      window.history.replaceState({}, '', url.toString());
    });
  });
}


/* ----------------------------------------------------------
   WIRE UP SEARCH INPUT
   Debounced so it doesn't re-render on every keystroke.
   ---------------------------------------------------------- */
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  let debounceTimer;

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = e.target.value;
      renderCards();
    }, 280); // Wait 280ms after user stops typing
  });

  // Style fix: white text placeholder on dark hero
  input.addEventListener('focus', () => {
    input.style.borderColor = 'rgba(255,255,255,0.6)';
    input.style.background  = 'rgba(255,255,255,0.18)';
  });
  input.addEventListener('blur', () => {
    input.style.borderColor = 'rgba(255,255,255,0.2)';
    input.style.background  = 'rgba(255,255,255,0.1)';
  });
}


/* ----------------------------------------------------------
   WIRE UP SORT DROPDOWN
   ---------------------------------------------------------- */
function initSort() {
  const select = document.getElementById('sort-select');
  if (!select) return;

  select.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderCards();
  });

  select.addEventListener('focus', () => {
    select.style.borderColor = 'var(--color-primary)';
  });
  select.addEventListener('blur', () => {
    select.style.borderColor = 'var(--color-border)';
  });
}


/* ----------------------------------------------------------
   RESET FILTERS (called by the empty-state button)
   ---------------------------------------------------------- */
function resetFilters() {
  state.activeCategory = 'all';
  state.searchQuery    = '';
  state.sortBy         = 'default';

  // Reset UI
  const input = document.getElementById('search-input');
  if (input) input.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });

  renderCards();

  // Clear URL param
  window.history.replaceState({}, '', window.location.pathname);
}

// Expose globally (called from HTML onclick)
window.resetFilters = resetFilters;


/* ----------------------------------------------------------
   CAPTION TICKER
   Mobile-only visual: auto-cycles through each category,
   briefly highlights its button, and updates the caption bar.
   On click the user's selection is shown and the ticker pauses
   for 3 s before resuming from the next item.
   ---------------------------------------------------------- */
function showCaptionFor(catId) {
  const cat = ticker.cats.find(c => c.id === catId);
  if (!cat) return;

  // Remove previous preview highlight
  document.querySelectorAll('.filter-btn--preview').forEach(b => {
    b.classList.remove('filter-btn--preview');
  });

  // Add preview highlight only on non-active buttons
  const btn = document.querySelector(`.filter-btn[data-category="${catId}"]`);
  if (btn && !btn.classList.contains('active')) {
    btn.classList.add('filter-btn--preview');
  }

  // Update caption bar text + icon with pop animation
  const iconEl = document.getElementById('filter-caption-icon');
  const textEl = document.getElementById('filter-caption-text');

  if (textEl) {
    textEl.style.animation = 'none';
    textEl.textContent = cat.label;
    // Force reflow then re-attach animation
    void textEl.offsetWidth;
    textEl.style.animation = 'captionPop 0.32s cubic-bezier(0.34,1.56,0.64,1) both';
  }
  if (iconEl) {
    iconEl.className = `fas ${cat.icon}`;
    iconEl.id = 'filter-caption-icon';
  }
}

function tickerStep() {
  if (ticker.paused) return;
  const cat = ticker.cats[ticker.idx];
  ticker.idx = (ticker.idx + 1) % ticker.cats.length;
  showCaptionFor(cat.id);
}

function startCaptionTicker(categories) {
  ticker.cats  = categories;
  ticker.idx   = 0;
  ticker.paused = false;
  clearInterval(ticker.timer);
  tickerStep();                              // show first immediately
  ticker.timer = setInterval(tickerStep, 1700);
}

function pauseTickerThen(ms) {
  ticker.paused = true;
  clearTimeout(ticker.resumeTimer);
  ticker.resumeTimer = setTimeout(() => {
    ticker.paused = false;
    // Remove any stale preview so ticker resumes cleanly
    document.querySelectorAll('.filter-btn--preview').forEach(b => {
      b.classList.remove('filter-btn--preview');
    });
  }, ms);
}


/* ----------------------------------------------------------
   READ URL PARAMS
   If the page is opened with ?category=lakes, pre-select that filter.
   ---------------------------------------------------------- */
function readURLParams() {
  const params   = new URLSearchParams(window.location.search);
  const category = params.get('category');
  if (category) {
    state.activeCategory = category;
  }
}


/* ----------------------------------------------------------
   MAIN INIT — Load data, build page
   ---------------------------------------------------------- */
async function initDiscoverPage() {
  readURLParams();

  try {
    const loader = window.CloudinaryMedia?.loadDataWithCloudinary;
    const payload = loader
      ? await loader('./js/data.json')
      : { data: await (await fetch('./js/data.json')).json() };

    const data = payload.data;
    state.allAttractions = data.attractions;

    renderFilterButtons(data.categories);
    startCaptionTicker(data.categories);
    renderCards();
    initSearch();
    initSort();

    if (typeof hidePreloader === 'function') hidePreloader();
  } catch (err) {
    console.error('Discover page: Failed to load data/media →', err);
    const grid = document.getElementById('discover-grid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;">
          <i class="fas fa-wifi" style="font-size:2.5rem;color:var(--color-border);margin-bottom:1rem;"></i>
          <h3 style="color:var(--color-text-muted);">Could not load destinations</h3>
          <p>Please check your connection and refresh.</p>
        </div>`;
    }

    if (typeof hidePreloader === 'function') hidePreloader();
  }
}

document.addEventListener('DOMContentLoaded', initDiscoverPage);
