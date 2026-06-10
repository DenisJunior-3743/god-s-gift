/**
 * attraction.js
 * ------------------------------------------------------------
 * Attraction detail page rendering with Cloudinary media support.
 */

function getAttractionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function optimizeImage(url, width = 1280) {
  if (!window.CloudinaryMedia) return url;
  return window.CloudinaryMedia.getOptimizedUrl(url, {
    width,
    crop: 'fill',
    gravity: 'auto',
  });
}

function populateHero(attraction) {
  const hero = document.getElementById('detail-hero');
  const heroContent = document.getElementById('detail-hero-content');

  if (hero) {
    hero.style.backgroundImage = `url('${optimizeImage(attraction.heroImage || attraction.images?.[0], 1800)}')`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }

  if (heroContent) {
    heroContent.innerHTML = `
      <div style="margin-bottom:1rem;">
        <span class="detail-region-badge">
          <i class="fas fa-map-marker-alt"></i>
          ${attraction.region}
        </span>
      </div>
      <h1>${attraction.name}</h1>
      <div class="tagline">${attraction.tagline}</div>
      <div class="detail-meta-row">
        <div class="detail-meta-tag"><i class="fas fa-clock"></i> ${attraction.duration}</div>
        <div class="detail-meta-tag"><i class="fas fa-calendar-alt"></i> Best: ${attraction.bestTime}</div>
        <div class="detail-meta-tag"><i class="fas fa-tag"></i> ${attraction.price}</div>
      </div>
    `;
  }

  document.title = `${attraction.name} | God's Gift Safaris Uganda`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', attraction.shortDesc);
}

function populateOverview(attraction) {
  const el = document.getElementById('detail-overview');
  if (!el) return;

  el.innerHTML = `
    <div class="detail-section-card">
      <span class="section-label">About This Destination</span>
      <h2 style="font-size:var(--fs-2xl);margin:0.75rem 0 1rem;">${attraction.name}</h2>
      <div class="divider divider-left"></div>
      <p style="font-size:var(--fs-md);line-height:1.9;color:var(--color-text-muted);">${attraction.fullDesc}</p>
    </div>
  `;

  const breadcrumb = document.getElementById('breadcrumb-name');
  if (breadcrumb) breadcrumb.textContent = attraction.name;
}

function populateHighlights(attraction) {
  const el = document.getElementById('detail-highlights');
  if (!el || !attraction.highlights?.length) return;

  const items = attraction.highlights.map((h) => `
    <div class="highlight-item">
      <div class="highlight-check"><i class="fas fa-check"></i></div>
      <span>${h}</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="detail-section-card">
      <h3 class="detail-section-heading">
        <i class="fas fa-binoculars"></i> What to Expect
      </h3>
      <div class="highlights-grid">${items}</div>
    </div>
  `;
}

function populateGallery(attraction) {
  const el = document.getElementById('detail-gallery');
  if (!el) return;

  const images = (attraction.images || []);
  if (!images.length) return;

  const galleryItems = images.map((src, i) => `
    <div class="gallery-item" role="button" tabindex="0" aria-label="View photo ${i + 1}">
      <img
        src="${optimizeImage(src, i === 0 ? 1600 : 1200)}"
        alt="${attraction.name} — photo ${i + 1}"
        loading="${i < 4 ? 'eager' : 'lazy'}"
        decoding="async"
        onerror="this.parentElement.style.display='none'"
      >
    </div>
  `).join('');

  el.innerHTML = `
    <div class="detail-section-card">
      <h3 class="detail-section-heading">
        <i class="fas fa-camera"></i> Photo Gallery
        <span class="detail-section-count">${images.length} photos</span>
      </h3>
      <div class="gallery-grid">${galleryItems}</div>
    </div>
  `;

  if (typeof initLightbox === 'function') initLightbox();
}

function populateVideo(attraction) {
  const el = document.getElementById('detail-video');
  if (!el || !attraction.video) return;

  const isEmbedded = attraction.video.includes('youtube.com') || attraction.video.includes('youtu.be');

  const videoEl = isEmbedded
    ? `<div class="video-responsive-wrap">
        <iframe
          src="${attraction.video}"
          title="${attraction.name} video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>`
    : `<div class="video-responsive-wrap">
        <video controls preload="metadata" playsinline>
          <source src="${attraction.video}" type="video/mp4">
        </video>
      </div>`;

  el.innerHTML = `
    <div class="detail-section-card">
      <h3 class="detail-section-heading">
        <i class="fas fa-play-circle"></i> Experience the Destination
      </h3>
      ${videoEl}
    </div>
  `;
}

function populateSidebar(attraction) {
  const el = document.getElementById('detail-sidebar');
  if (!el) return;

  const cats = attraction.category
    .map(c => c.charAt(0).toUpperCase() + c.slice(1))
    .join(' · ');

  el.innerHTML = `
    <div class="detail-sidebar-card">

      <div class="detail-sidebar-price">
        ${attraction.price}
        <span>/ per person</span>
      </div>

      <div class="detail-info-list">
        <div class="detail-info-item">
          <span class="detail-info-label"><i class="fas fa-map-marker-alt"></i> Location</span>
          <span class="detail-info-value">${attraction.region}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label"><i class="fas fa-clock"></i> Duration</span>
          <span class="detail-info-value">${attraction.duration}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label"><i class="fas fa-sun"></i> Best Time</span>
          <span class="detail-info-value">${attraction.bestTime}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label"><i class="fas fa-layer-group"></i> Type</span>
          <span class="detail-info-value">${cats}</span>
        </div>
      </div>

      <a href="contact.html?attraction=${attraction.id}"
         class="btn btn-primary"
         style="width:100%;justify-content:center;margin-bottom:0.75rem;">
        <i class="fas fa-calendar-check"></i>
        Book This Trip
      </a>

      <a href="https://wa.me/256782456789?text=Hi%20God's%20Gift%20Safaris%2C%20I'm%20interested%20in%20${encodeURIComponent(attraction.name)}!"
         class="btn btn-outline-dark"
         style="width:100%;justify-content:center;"
         target="_blank" rel="noopener noreferrer">
        <i class="fab fa-whatsapp" style="color:#25D366;"></i>
        Chat on WhatsApp
      </a>

      <div class="sidebar-share">
        <p class="sidebar-share-label">Share This Destination</p>
        <div class="sidebar-share-btns">
          <button onclick="shareDestination('facebook')" class="social-btn" style="background:var(--color-surface);" aria-label="Share on Facebook">
            <i class="fab fa-facebook-f" style="color:#1877F2;"></i>
          </button>
          <button onclick="shareDestination('twitter')" class="social-btn" style="background:var(--color-surface);" aria-label="Share on Twitter">
            <i class="fab fa-twitter" style="color:#1DA1F2;"></i>
          </button>
          <button onclick="shareDestination('whatsapp')" class="social-btn" style="background:var(--color-surface);" aria-label="Share on WhatsApp">
            <i class="fab fa-whatsapp" style="color:#25D366;"></i>
          </button>
          <button onclick="copyLink()" class="social-btn" style="background:var(--color-surface);" id="copy-link-btn" aria-label="Copy link">
            <i class="fas fa-link" style="color:var(--color-text-muted);"></i>
          </button>
        </div>
      </div>

    </div>
  `;
}

function populateRelated(attraction, allAttractions) {
  const el = document.getElementById('detail-related');
  if (!el) return;

  const primaryCategory = attraction.category[0];
  const related = allAttractions
    .filter((a) => a.id !== attraction.id && a.category.includes(primaryCategory))
    .slice(0, 3);

  if (!related.length) return;

  const cards = related.map((a) => `
    <a href="attraction.html?id=${a.id}" class="attraction-card" aria-label="View ${a.name}">
      <div class="card-img-wrap" style="height:180px;">
        <img src="${optimizeImage(a.images[0], 900)}" alt="${a.name}" loading="lazy" decoding="async">
        <div class="card-img-overlay"></div>
      </div>
      <div class="card-body">
        <div class="card-tagline">${a.tagline}</div>
        <h4 class="card-title" style="font-size:1rem;">${a.name}</h4>
        <div class="card-footer">
          <span class="card-price">${a.price}</span>
          <span class="card-cta">Explore <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </a>
  `).join('');

  el.innerHTML = `
    <div style="margin-top:3rem;padding-top:3rem;border-top:1px solid var(--color-border);">
      <h3 style="font-size:var(--fs-xl);margin-bottom:1.5rem;">
        <i class="fas fa-compass" style="color:var(--color-primary);margin-right:0.5rem;"></i>
        You Might Also Like
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem;">
        ${cards}
      </div>
    </div>
  `;
}

function shareDestination(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);

  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
  };

  if (urls[platform]) {
    window.open(urls[platform], '_blank', 'width=600,height=400');
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    if (typeof showToast === 'function') showToast('Link copied to clipboard!', 'success');

    const btn = document.getElementById('copy-link-btn');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-check" style="color:var(--color-primary);"></i>';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-link" style="color:var(--color-text-muted);"></i>';
      }, 2000);
    }
  });
}

window.shareDestination = shareDestination;
window.copyLink = copyLink;

function show404() {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:var(--color-surface);font-family:'Lato',sans-serif;">
      <i class="fas fa-map-marked-alt" style="font-size:4rem;color:var(--color-border);margin-bottom:1.5rem;"></i>
      <h1 style="font-family:'Playfair Display',serif;color:var(--color-dark);margin-bottom:0.75rem;">Destination Not Found</h1>
      <p style="color:var(--color-text-muted);max-width:400px;margin-bottom:2rem;">
        The attraction you're looking for doesn't exist or the link may be incorrect.
      </p>
      <a href="discover.html" style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--color-primary);color:white;padding:0.875rem 2rem;border-radius:9999px;font-family:Montserrat,sans-serif;font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;text-decoration:none;">
        <i class="fas fa-compass"></i>
        Browse All Destinations
      </a>
    </div>
  `;
}

async function initAttractionPage() {
  const id = getAttractionId();
  if (!id) {
    show404();
    return;
  }

  try {
    const loader = window.CloudinaryMedia?.loadDataWithCloudinary;
    const payload = loader ? await loader('./js/data.json') : { data: await (await fetch('./js/data.json')).json() };
    const data = payload.data;

    const attraction = data.attractions.find((a) => a.id === id);
    if (!attraction) {
      show404();
      return;
    }

    populateHero(attraction);
    populateOverview(attraction);
    populateHighlights(attraction);
    populateGallery(attraction);
    populateVideo(attraction);
    populateSidebar(attraction);
    populateRelated(attraction, data.attractions);

    if (typeof AOS !== 'undefined') {
      setTimeout(() => AOS.refresh(), 200);
    }

    if (typeof hidePreloader === 'function') hidePreloader();
  } catch (err) {
    console.error('Attraction page media/data error:', err);
    show404();
    if (typeof hidePreloader === 'function') hidePreloader();
  }
}

document.addEventListener('DOMContentLoaded', initAttractionPage);
