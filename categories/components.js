/**
 * components.js
 * ============================================================
 * God's Gift Safaris — Modular Component Injection System
 *
 * This file handles injecting shared UI components (navbar,
 * footer, WhatsApp button, preloader) into every HTML page.
 * This means we write the navbar and footer ONCE here, and
 * every page includes it automatically via JavaScript.
 *
 * How it works:
 *   1. Each HTML page has placeholder <div> elements with IDs:
 *      - #navbar-placeholder  → receives the navbar HTML
 *      - #footer-placeholder  → receives the footer HTML
 *   2. On DOMContentLoaded, this script replaces those divs
 *      with the actual component HTML.
 *   3. After injection, it runs post-init (active link, scroll
 *      listener, hamburger menu).
 *
 * Usage in HTML:
 *   <div id="navbar-placeholder"></div>
 *   <div id="footer-placeholder"></div>
 *   <script src="js/components.js"></script>
 * ============================================================
 */


/* ----------------------------------------------------------
   NAV LINKS CONFIGURATION
   Define all navigation links here — change once, updates
   every page automatically.
   ---------------------------------------------------------- */
const NAV_LINKS = [
  { href: 'index.html',      label: 'Home',     icon: 'fa-house' },
  { href: 'discover.html',   label: 'Discover', icon: 'fa-compass' },
  { href: 'about.html',      label: 'About Us', icon: 'fa-users' },
  { href: 'contact.html',    label: 'Contact',  icon: 'fa-envelope' },
];

/* ----------------------------------------------------------
   FOOTER QUICK LINKS
   ---------------------------------------------------------- */
const FOOTER_QUICK_LINKS = [
  { href: 'index.html',      label: 'Home' },
  { href: 'discover.html',   label: 'Discover Destinations' },
  { href: 'about.html',      label: 'About Us' },
  { href: 'contact.html',    label: 'Contact Us' },
];

const FOOTER_DESTINATIONS = [
  { href: 'attraction.html?id=bwindi',          label: 'Bwindi Impenetrable Forest' },
  { href: 'attraction.html?id=queen-elizabeth', label: 'Queen Elizabeth NP' },
  { href: 'attraction.html?id=murchison-falls', label: 'Murchison Falls' },
  { href: 'attraction.html?id=kidepo',          label: 'Kidepo Valley NP' },
  { href: 'attraction.html?id=lake-bunyonyi',   label: 'Lake Bunyonyi' },
  { href: 'discover.html',                       label: 'View All Destinations →' },
];


/* ----------------------------------------------------------
   buildNavbar()
   Returns the full navbar HTML string.
   Loops over NAV_LINKS to build the <li> items — no need to
   duplicate HTML per page.
   ---------------------------------------------------------- */
function buildNavbar() {
  // Build the desktop nav link items
  const desktopLinks = NAV_LINKS.map(link =>
    `<li><a href="${link.href}">${link.label}</a></li>`
  ).join('');

  // Build mobile overlay links (icon + label)
  const mobileLinks = NAV_LINKS.map(link =>
    `<a href="${link.href}" class="mobile-nav-link">
       <span class="mobile-nav-icon"><i class="fas ${link.icon}"></i></span>
       <span class="mobile-nav-label">${link.label}</span>
     </a>`
  ).join('');

  return `
    <!-- ===== NAVBAR ===== -->
    <nav id="navbar">
      <div class="container nav-inner">

        <!-- Logo -->
        <a href="index.html" class="nav-logo" id="nav-logo-container">
          <div class="nav-logo-rect">
            <img
              src="assets/logo/logo.png"
              alt="God's Gift Safaris Uganda Limited"
              class="nav-logo-img"
            >
          </div>
        </a>

        <!-- Desktop navigation links -->
        <ul class="nav-links">
          ${desktopLinks}
        </ul>

        <!-- Desktop CTA button -->
        <div class="nav-cta">
          <a href="contact.html" class="btn btn-accent">
            <i class="fas fa-calendar-check"></i>
            Book a Safari
          </a>
        </div>

        <!-- Mobile hamburger button -->
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div><!-- /.nav-inner -->
    </nav><!-- /#navbar -->

    <!-- ===== MOBILE MENU OVERLAY ===== -->
    <div class="nav-mobile-overlay" id="nav-mobile-overlay">
      <div class="mobile-nav-list">
        ${mobileLinks}
      </div>
      <a href="contact.html" class="btn btn-accent mobile-nav-book">
        <i class="fas fa-calendar-check"></i>
        Book a Safari
      </a>
      <p class="mobile-nav-motto">"Discover Uganda — God's Gift to Africa"</p>
    </div>
  `;
}


/* ----------------------------------------------------------
   buildFooter()
   Returns the full footer HTML string.
   ---------------------------------------------------------- */
function buildFooter() {
  const quickLinks  = FOOTER_QUICK_LINKS.map(l =>
    `<a href="${l.href}">${l.label}</a>`).join('');
  const destLinks   = FOOTER_DESTINATIONS.map(l =>
    `<a href="${l.href}">${l.label}</a>`).join('');
  const currentYear = new Date().getFullYear();

  return `
    <!-- ===== FOOTER ===== -->
    <footer id="site-footer">
      <div class="container">

        <!-- 4-column footer grid -->
        <div class="footer-grid">

          <!-- Column 1: Brand -->
          <div class="footer-col">
            <a href="index.html" class="nav-logo" style="margin-bottom:1.25rem;">
              <div class="nav-logo-rect nav-logo-rect--footer">
                <img
                  src="assets/logo/logo.png"
                  alt="God's Gift Safaris Uganda Limited"
                  class="nav-logo-img"
                >
              </div>
              <div class="nav-logo-text">
                <span class="nav-logo-primary" style="color:rgba(255,255,255,0.92);">God's Gift Safaris</span>
                <span class="nav-logo-sub" style="color:var(--color-accent);">Uganda Limited</span>
              </div>
            </a>
            <p style="font-family:var(--font-display);font-style:italic;font-size:0.9rem;color:var(--color-accent-light);margin-bottom:0.75rem;letter-spacing:0.01em;">
              "Discover Uganda — God's Gift to Africa"
            </p>
            <p class="footer-brand-desc">
              Experience the magic of Uganda — from mountain gorillas in Bwindi
              to the thundering Murchison Falls. God's Gift Safaris brings you closer
              to Africa's most extraordinary wild places.
            </p>
            <!-- Social media links -->
            <div class="footer-socials">
              <a href="#" class="social-btn" aria-label="Facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" class="social-btn" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" class="social-btn" aria-label="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="social-btn" aria-label="YouTube">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <!-- Column 2: Quick Links -->
          <div class="footer-col">
            <h4>Quick Links</h4>
            <nav class="footer-links">
              ${quickLinks}
            </nav>
          </div>

          <!-- Column 3: Top Destinations -->
          <div class="footer-col">
            <h4>Top Destinations</h4>
            <nav class="footer-links">
              ${destLinks}
            </nav>
          </div>

          <!-- Column 4: Newsletter -->
          <div class="footer-col">
            <h4>Stay Updated</h4>
            <p style="font-size:0.875rem;color:rgba(255,255,255,0.55);line-height:1.7;margin-bottom:0.5rem;">
              Get safari tips, destination guides and exclusive deals in your inbox.
            </p>
            <form class="footer-newsletter-form" id="newsletter-form" novalidate>
              <input type="email" placeholder="Your email address" id="newsletter-email" required>
              <button type="submit"><i class="fas fa-paper-plane"></i></button>
            </form>

            <!-- Contact details -->
            <div style="margin-top:1.5rem;">
              <p style="font-size:0.8rem;color:rgba(255,255,255,0.45);margin-bottom:0.5rem;">
                <i class="fas fa-map-marker-alt" style="color:#2d8b47;margin-right:6px;"></i>
                Kampala, Uganda
              </p>
              <p style="font-size:0.8rem;color:rgba(255,255,255,0.45);margin-bottom:0.5rem;">
                <i class="fas fa-phone" style="color:#2d8b47;margin-right:6px;"></i>
                +256 782 456 789
              </p>
              <p style="font-size:0.8rem;color:rgba(255,255,255,0.45);">
                <i class="fas fa-envelope" style="color:#2d8b47;margin-right:6px;"></i>
                info@godsgiftsafaris.ug
              </p>
            </div>
          </div>

        </div><!-- /.footer-grid -->

        <!-- Footer bottom bar -->
        <div class="footer-bottom">
          <p>© ${currentYear} God's Gift Safaris Uganda Limited. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>

      </div><!-- /.container -->
    </footer><!-- /#site-footer -->
  `;
}


/* ----------------------------------------------------------
   buildPreloader()
   Full-screen cinematic 3D loading animation.
   ---------------------------------------------------------- */
function buildPreloader() {
  return `
    <div id="preloader">
      <div class="preloader-scene">
        <div class="preloader-ring"></div>
        <div class="preloader-logo-3d">
          <div class="preloader-logo-card">
            <img src="assets/logo/logo.png" alt="God's Gift Safaris" class="preloader-logo-img">
          </div>
        </div>
        <div class="preloader-brand">
          <span class="preloader-brand-name">God's Gift Safaris</span>
          <span class="preloader-brand-sub">Uganda Limited</span>
        </div>
        <div class="preloader-motto">"Discover Uganda — God's Gift to Africa"</div>
        <div class="preloader-bar">
          <div class="preloader-bar-fill"></div>
        </div>
      </div>
    </div>
  `;
}


/* ----------------------------------------------------------
   buildWhatsApp()
   Floating WhatsApp contact button (fixed, bottom-right).
   ---------------------------------------------------------- */
function buildWhatsApp() {
  return `
    <!-- ===== WHATSAPP FLOAT ===== -->
    <a
      href="https://wa.me/256782456789?text=Hello%20God's%20Gift%20Safaris%2C%20I'm%20interested%20in%20a%20safari%20trip%20to%20Uganda!"
      class="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <i class="fab fa-whatsapp"></i>
    </a>
  `;
}


/* ----------------------------------------------------------
   buildMobileBottomNav()
   Fixed bottom navigation bar shown only on mobile (≤768px).
   Provides thumb-friendly access to all main pages.
   ---------------------------------------------------------- */
function buildMobileBottomNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const items = [
    { href: 'index.html',    label: 'Home',     icon: 'fa-house' },
    { href: 'discover.html', label: 'Discover', icon: 'fa-compass' },
    { href: 'about.html',    label: 'About',    icon: 'fa-users' },
    { href: 'contact.html',  label: 'Book',     icon: 'fa-calendar-check', cta: true },
  ];

  const navItems = items.map(item => {
    const isActive = item.href.split('/').pop() === currentPage;
    return `
      <a href="${item.href}"
         class="mobile-bnav-item${isActive ? ' active' : ''}${item.cta ? ' mobile-bnav-cta' : ''}"
         aria-label="${item.label}">
        <span class="mobile-bnav-icon"><i class="fas ${item.icon}"></i></span>
        <span class="mobile-bnav-label">${item.label}</span>
      </a>`;
  }).join('');

  return `<nav class="mobile-bnav" id="mobile-bnav" aria-label="Mobile navigation">${navItems}</nav>`;
}


/* ----------------------------------------------------------
   injectComponents()
   Main injection function. Finds the placeholder divs in each
   HTML page and replaces their innerHTML with the built HTML.
   ---------------------------------------------------------- */
function injectComponents() {
  // --- Inject preloader only if the page hasn't already hardcoded one ---
  if (!document.getElementById('preloader')) {
    const preloaderEl = document.createElement('div');
    preloaderEl.innerHTML = buildPreloader();
    document.body.insertBefore(preloaderEl.firstElementChild, document.body.firstChild);
  }

  // --- Inject navbar ---
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    navbarPlaceholder.outerHTML = buildNavbar();
  }

  // --- Inject footer ---
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = buildFooter();
  }

  // --- Inject WhatsApp button ---
  const waEl = document.createElement('div');
  waEl.innerHTML = buildWhatsApp();
  document.body.appendChild(waEl.firstElementChild);

  // --- Inject mobile bottom navigation bar ---
  const bnavEl = document.createElement('div');
  bnavEl.innerHTML = buildMobileBottomNav();
  document.body.appendChild(bnavEl.firstElementChild);

  // --- Run post-injection initializers ---
  initNavbar();
  initPreloader();
  initNewsletter();
}


/* ----------------------------------------------------------
   initNavbar()
   After navbar HTML is injected into the DOM:
   1. Marks the current page's nav link as "active"
   2. Adds scroll listener to toggle .scrolled class
   3. Wires up the mobile hamburger menu
   ---------------------------------------------------------- */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileOverlay = document.getElementById('nav-mobile-overlay');

  if (!navbar) return;

  // --- 1. Mark active nav link based on current page filename ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-link').forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) link.classList.add('active');
  });

  // --- 2. Scroll listener: add/remove .scrolled class on navbar ---
  // When user scrolls past 60px, the navbar transitions from
  // transparent to white with a shadow.
  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on load in case page is already scrolled

  // --- 3. Mobile hamburger toggle ---
  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileOverlay.style.display = 'flex'; // ensure display:flex before opacity
      // Small delay lets display:flex take effect before opacity transition
      requestAnimationFrame(() => {
        mobileOverlay.classList.toggle('open', isOpen);
      });
      document.body.classList.toggle('menu-open', isOpen);
    });

    // Close mobile menu when any overlay link is clicked
    mobileOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileOverlay.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hamburger.classList.remove('open');
        mobileOverlay.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });
  }
}


/* ----------------------------------------------------------
   initPreloader()
   Hides the preloader once the page has fully loaded.
   Uses a minimum display time (600ms) to avoid a flash,
   then fades it out smoothly.
   ---------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const MIN_DISPLAY = 800; // milliseconds — feel free to adjust
  const startTime = Date.now();

  window.addEventListener('load', () => {
    const elapsed  = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY - elapsed);

    setTimeout(() => {
      preloader.classList.add('hidden');
      // Remove from DOM entirely after transition completes
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
      }, { once: true });
    }, remaining);
  });
}


/* ----------------------------------------------------------
   initNewsletter()
   Handles the footer newsletter form submission.
   Since there's no backend, we just show a success message.
   ---------------------------------------------------------- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    if (emailInput && emailInput.value) {
      // Replace form with success message
      form.innerHTML = `
        <p style="color:var(--color-accent);font-family:var(--font-accent);font-size:0.875rem;font-weight:600;">
          <i class="fas fa-check-circle"></i>
          Thank you! You're subscribed.
        </p>
      `;
    }
  });
}


/* ----------------------------------------------------------
   DOM READY — Kick off component injection
   Using DOMContentLoaded (not 'load') so the navbar and
   footer appear before images finish loading.
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', injectComponents);
