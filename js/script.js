const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuClose = document.querySelector('.menu-close');
const bookingModal = document.querySelector('.booking-modal');
const openBookingButtons = document.querySelectorAll('.js-open-booking');
const closeBookingButtons = document.querySelectorAll('.js-close-booking');
const lightbox = document.querySelector('.lightbox');
const lightboxTitle = document.querySelector('.lightbox h3');
const lightboxText = document.querySelector('.lightbox p');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxCategory = document.querySelector('.lightbox-category');
const lightboxClose = document.querySelector('.lightbox-close');
const portfolioGrid = document.querySelector('#portfolioGrid');
const galleryFilters = document.querySelectorAll('.gallery-filter');
const siteHeader = document.querySelector('.site-header');
const menuPeek = document.querySelector('.menu-peek');

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

/* Header behavior */
window.addEventListener('scroll', () => {
  if (!header) return;

  header.classList.toggle('scrolled', window.scrollY > 40);

  if (!siteHeader || !menuPeek) return;

  if (window.scrollY > 120) {
    siteHeader.classList.add('menu-hidden');
    menuPeek.classList.add('is-visible');
  } else {
    siteHeader.classList.remove('menu-hidden');
    menuPeek.classList.remove('is-visible');
  }
});

if (menuPeek && siteHeader) {
  menuPeek.addEventListener('click', () => {
    siteHeader.classList.remove('menu-hidden');
    menuPeek.classList.remove('is-visible');
  });
}

/* Mobile menu */
menuToggle?.addEventListener('click', () => {
  mobileMenu?.classList.add('active');
  mobileMenu?.setAttribute('aria-hidden', 'false');
});

menuClose?.addEventListener('click', () => {
  mobileMenu?.classList.remove('active');
  mobileMenu?.setAttribute('aria-hidden', 'true');
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.remove('active');
    mobileMenu?.setAttribute('aria-hidden', 'true');
  });
});

/* Booking modal */
function openBooking() {
  bookingModal?.classList.add('active');
  bookingModal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeBooking() {
  bookingModal?.classList.remove('active');
  bookingModal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

openBookingButtons.forEach(btn => btn.addEventListener('click', openBooking));
closeBookingButtons.forEach(btn => btn.addEventListener('click', closeBooking));

/* Accordion */
document.querySelectorAll('.accordion-btn').forEach(button => {
  button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const isOpen = button.classList.toggle('open');
    const icon = button.querySelector('span');

    if (icon) icon.textContent = isOpen ? '−' : '+';
    if (panel) panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : null;
  });
});

/* CMS portfolio gallery */
const fallbackGallery = [
  {
    title: 'Black & Grey Piece',
    category: 'Black & Grey',
    description: 'Soft shading, contrast, and clean black and grey detail.',
    image: ''
  },
  {
    title: 'Fine Line Detail',
    category: 'Fine Line',
    description: 'Delicate linework with a clean, minimal finish.',
    image: ''
  },
  {
    title: 'Micro Realism',
    category: 'Micro Realism',
    description: 'Small-scale realistic detail with precision and balance.',
    image: ''
  },
  {
    title: 'Ornamental Design',
    category: 'Ornamental',
    description: 'Decorative composition created around flow and placement.',
    image: ''
  }
];

let galleryData = [];

function normalizeCategory(category) {
  return String(category || '').trim().toLowerCase();
}

function renderGallery(filter = 'All') {
  if (!portfolioGrid) return;

  const selected = normalizeCategory(filter);
  const items = selected === 'all'
    ? galleryData
    : galleryData.filter(item => normalizeCategory(item.category) === selected);

  if (!items.length) {
    portfolioGrid.innerHTML = `
      <article class="portfolio-empty">
        <h3>No images yet</h3>
        <p>Add images for this style from the admin panel.</p>
      </article>
    `;
    return;
  }

  portfolioGrid.innerHTML = items.map((item, index) => {
    const title = item.title || 'Custom Tattoo';
    const category = item.category || 'Custom';
    const description = item.description || 'Custom tattoo work by Linz Tattoo.';
    const image = item.image || '';

    return `
      <button class="portfolio-card" type="button"
        data-title="${escapeHtml(title)}"
        data-category="${escapeHtml(category)}"
        data-desc="${escapeHtml(description)}"
        data-image="${escapeHtml(image)}">
        <div class="portfolio-card-image"${image ? ` style="background-image: url('${escapeHtml(image)}')"` : ''}></div>
        <div class="portfolio-card-info">
          <span>${escapeHtml(category)}</span>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </button>
    `;
  }).join('');

  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('click', () => openLightbox({
      title: card.dataset.title,
      category: card.dataset.category,
      description: card.dataset.desc,
      image: card.dataset.image
    }));
  });
}

function updateActiveFilter(activeButton) {
  galleryFilters.forEach(button => button.classList.remove('active'));
  activeButton.classList.add('active');
}

galleryFilters.forEach(button => {
  button.addEventListener('click', () => {
    updateActiveFilter(button);
    renderGallery(button.dataset.filter || 'All');
  });
});

async function loadGallery() {
  try {
    const response = await fetch('data/gallery.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Gallery file not found');

    const data = await response.json();
    galleryData = Array.isArray(data.gallery) ? data.gallery : fallbackGallery;
  } catch (error) {
    galleryData = fallbackGallery;
  }

  renderGallery('All');
}

function openLightbox(item) {
  if (!lightbox) return;

  if (lightboxTitle) lightboxTitle.textContent = item.title || 'Linz Tattoo';
  if (lightboxText) lightboxText.textContent = item.description || 'Custom tattoo work.';
  if (lightboxCategory) lightboxCategory.textContent = item.category || '';

  if (lightboxImage) {
    if (item.image) {
      lightboxImage.src = item.image;
      lightboxImage.alt = item.title || 'Tattoo portfolio image';
      lightboxImage.style.display = 'block';
    } else {
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
      lightboxImage.style.display = 'none';
    }
  }

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox?.classList.remove('active');
  lightbox?.setAttribute('aria-hidden', 'true');
}

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeBooking();
    closeLightbox();
    mobileMenu?.classList.remove('active');
  }
});

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/* Reveal animation */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.section-reveal').forEach(section => revealObserver.observe(section));

loadGallery();
