/**
 * main.js
 * ============================================================
 * God's Gift Safaris — Home Page (index.html) Rendering Logic
 * ============================================================
 */

function optimizeImage(url, width = 900) {
  if (!window.CloudinaryMedia) return url;
  return window.CloudinaryMedia.getOptimizedUrl(url, {
    width,
    crop: 'fill',
    gravity: 'auto',
  });
}

function renderFeaturedAttractions(attractions) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const featured = attractions.slice(0, 4);
  if (!featured.length) return;

  grid.innerHTML = featured.map((attr, idx) => `
    <a href="attraction.html?id=${attr.id}" class="attraction-card" data-aos="fade-up" data-aos-delay="${idx * 100}">
      <div class="card-img-wrap">
        <img
          src="${optimizeImage(attr.images[0], idx === 0 ? 1200 : 900)}"
          alt="${attr.name}"
          loading="lazy"
          decoding="async"
          onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(attr.name)}'"
        >
        <div class="card-img-overlay"></div>

        ${attr.category && attr.category[0] ? `
          <div class="card-category-badge">
            <span class="badge badge-green">
              <i class="fas fa-${getCategoryIcon(attr.category[0])}"></i>
              ${getCategoryLabel(attr.category[0])}
            </span>
          </div>
        ` : ''}
      </div>

      <div class="card-body">
        <h3 class="card-title">${attr.name}</h3>
        <p class="text-muted" style="font-size:0.9rem;margin-bottom:1rem;flex:1;">
          ${attr.shortDesc || attr.tagline}
        </p>

        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:var(--color-text-light);">
          <i class="fas fa-clock"></i>
          <span>${attr.duration}</span>
          <span style="margin-left:auto;">${attr.price}</span>
        </div>
      </div>
    </a>
  `).join('');

  if (window.AOS) AOS.refresh();
}

function renderWhyUs(whyUsData) {
  const grid = document.getElementById('why-us-grid');
  if (!grid || !whyUsData) return;

  grid.innerHTML = whyUsData.slice(0, 4).map((item, idx) => `
    <div class="why-card" data-aos="fade-up" data-aos-delay="${idx * 100}">
      <div class="why-icon">
        <i class="${item.icon}"></i>
      </div>
      <div class="why-content">
        <h4>${item.title}</h4>
        <p>${item.desc || item.description}</p>
      </div>
    </div>
  `).join('');

  if (window.AOS) AOS.refresh();
}

function renderTestimonials(testimonials) {
  const grid = document.getElementById('testimonials-grid');
  if (!grid || !testimonials) return;

  grid.innerHTML = testimonials.slice(0, 4).map((review, idx) => `
    <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${idx * 100}">
      <div class="testimonial-quote-icon">"</div>
      <p class="testimonial-text">"${review.text}"</p>
      <div class="testimonial-author">
        <img
          src="${review.avatar || 'https://via.placeholder.com/48'}"
          alt="${review.name}"
          class="testimonial-avatar"
          loading="lazy"
          decoding="async"
        >
        <div class="testimonial-info">
          <div class="name">${review.name}</div>
          <div class="origin">${review.origin || review.country || ''}</div>
          ${review.attraction ? `<div class="testimonial-attraction">📍 ${review.attraction}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  if (window.AOS) AOS.refresh();
}

function hydrateCategoryCards(attractions) {
  const cards = document.querySelectorAll('#category-grid .category-card');
  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const category = href.split('category=')[1];
    if (!category) return;

    const pick = attractions.find((a) => a.category.includes(category) && a.images?.length);
    const image = card.querySelector('img');

    if (pick && image) {
      image.src = optimizeImage(pick.images[0], 1000);
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = `${pick.name} - ${category}`;
    }
  });
}

function getCategoryIcon(categoryId) {
  const iconMap = {
    parks: 'tree',
    lakes: 'water',
    mountains: 'mountain',
    culture: 'drum',
    wildlife: 'paw',
    adventure: 'hiking',
  };
  return iconMap[categoryId] || 'globe-africa';
}

function getCategoryLabel(categoryId) {
  const labelMap = {
    parks: 'National Parks',
    lakes: 'Lakes',
    mountains: 'Mountains',
    culture: 'Culture',
    wildlife: 'Wildlife',
    adventure: 'Adventure',
  };
  return labelMap[categoryId] || 'Destination';
}

async function loadHomeData() {
  try {
    const loader = window.CloudinaryMedia?.loadDataWithCloudinary;
    const payload = loader ? await loader('./js/data.json') : { data: await (await fetch('./js/data.json')).json(), manifest: null };
    const { data, manifest } = payload;

    renderFeaturedAttractions(data.attractions);
    renderWhyUs(data.why_us);
    renderTestimonials(data.testimonials);
    hydrateCategoryCards(data.attractions);

    window.CloudinaryMedia?.applyHeroVideoFromManifest(manifest);

    if (typeof hidePreloader === 'function') hidePreloader();
  } catch (err) {
    console.error("God's Gift Safaris: Failed to load data.json →", err);
    const grid = document.getElementById('featured-grid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;">
          <i class="fas fa-exclamation-circle" style="font-size:2rem;color:var(--color-text-light);"></i>
          <p style="margin-top:1rem;color:var(--color-text-muted);">
            Destinations could not be loaded. Please refresh the page.
          </p>
        </div>`;
    }
    if (typeof hidePreloader === 'function') hidePreloader();
  }
}

document.addEventListener('DOMContentLoaded', loadHomeData);
