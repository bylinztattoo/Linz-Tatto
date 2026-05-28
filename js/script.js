/* =========================================================
   LINZ TATTOO - MAIN SCRIPT
   Internal gallery system + admin-ready data
   ========================================================= */

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Year */
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

/* Header hide/show on scroll */
const header = $(".site-header");
const menuPeek = $(".menu-peek");
let lastScrollY = window.scrollY;

function updateHeaderOnScroll() {
  if (!header || !menuPeek) return;

  const currentY = window.scrollY;
  const scrollingDown = currentY > lastScrollY && currentY > 120;

  if (scrollingDown) {
    header.classList.add("menu-hidden");
    menuPeek.classList.add("is-visible");
  } else if (currentY < 60) {
    header.classList.remove("menu-hidden");
    menuPeek.classList.remove("is-visible");
  }

  if (currentY > 20) header.classList.add("scrolled");
  else header.classList.remove("scrolled");

  lastScrollY = currentY;
}

window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });

if (menuPeek && header) {
  menuPeek.addEventListener("click", () => {
    header.classList.remove("menu-hidden");
    menuPeek.classList.remove("is-visible");
  });
}

/* Mobile menu */
const menuToggle = $(".menu-toggle");
const mobileMenu = $(".mobile-menu");
const menuClose = $(".menu-close");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    mobileMenu.setAttribute("aria-hidden", "false");
  });
}

if (menuClose && mobileMenu) {
  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
}

$$(".mobile-menu a, .mobile-menu .js-open-booking").forEach(item => {
  item.addEventListener("click", () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("active");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
});

/* Booking modal */
const bookingModal = $(".booking-modal");
const openBookingButtons = $$(".js-open-booking");
const closeBookingButtons = $$(".js-close-booking");

function openBooking() {
  if (!bookingModal) return;
  bookingModal.classList.add("active");
  bookingModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeBooking() {
  if (!bookingModal) return;
  bookingModal.classList.remove("active");
  bookingModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openBookingButtons.forEach(btn => btn.addEventListener("click", openBooking));
closeBookingButtons.forEach(btn => btn.addEventListener("click", closeBooking));

/* FAQ accordion */
$$(".accordion-btn").forEach(button => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const isOpen = button.classList.toggle("active");

    if (!panel) return;
    if (isOpen) {
      panel.style.maxHeight = panel.scrollHeight + "px";
      const icon = $("span", button);
      if (icon) icon.textContent = "−";
    } else {
      panel.style.maxHeight = null;
      const icon = $("span", button);
      if (icon) icon.textContent = "+";
    }
  });
});

/* Reveal animation */
const revealItems = $$(".section-reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

/* =========================================================
   Portfolio internal galleries
   Data source: data/portfolio.json
   Structure:
   {
     "galleries": [
       {
         "category": "Fine Line Detail",
         "title": "Fine Line Detail",
         "coverImage": "/img/uploads/cover.jpg",
         "description": "...",
         "images": [
           { "image": "/img/uploads/1.jpg", "title": "...", "description": "..." }
         ]
       }
     ]
   }
   ========================================================= */

const portfolioGrid = $("#portfolioGrid");
const galleryFilters = $$(".gallery-filter");

const fallbackGalleries = [
  {
    category: "Black & Grey Piece",
    title: "Black & Grey Piece",
    description: "Custom black and grey tattoo work with contrast, softness, and detail.",
    coverImage: "",
    images: []
  },
  {
    category: "Fine Line Detail",
    title: "Fine Line Detail",
    description: "Delicate fine line tattoo work focused on clean details and elegant placement.",
    coverImage: "",
    images: []
  },
  {
    category: "Micro Realism",
    title: "Micro Realism",
    description: "Small-scale realistic tattoo work with precision and subtle contrast.",
    coverImage: "",
    images: []
  },
  {
    category: "Realism",
    title: "Realism",
    description: "Realistic custom tattoo compositions with depth, texture, and visual strength.",
    coverImage: "",
    images: []
  },
  {
    category: "Color",
    title: "Color",
    description: "Color tattoo work designed with balance, composition, and personality.",
    coverImage: "",
    images: []
  },
  {
    category: "Other",
    title: "Other",
    description: "Additional custom tattoo ideas and styles outside the main categories.",
    coverImage: "",
    images: []
  }
];

let portfolioGalleries = [...fallbackGalleries];
let activeFilter = "All";
let activeGallery = null;
let activeImageIndex = 0;

function normalizePortfolioData(data) {
  if (Array.isArray(data?.galleries)) return data.galleries;

  /* Backward compatibility with older portfolio formats */
  if (Array.isArray(data?.portfolio)) {
    const grouped = {};
    data.portfolio.forEach(item => {
      const category = item.category || "Other";
      if (!grouped[category]) {
        grouped[category] = {
          category,
          title: item.title || category,
          description: item.description || "",
          coverImage: item.coverImage || item.image || "",
          images: []
        };
      }

      if (item.image) {
        grouped[category].images.push({
          image: item.image,
          title: item.title || category,
          description: item.description || ""
        });
      }
    });

    return Object.values(grouped);
  }

  return fallbackGalleries;
}

function mergeWithFallback(galleries) {
  return fallbackGalleries.map(defaultGallery => {
    const found = galleries.find(g => g.category === defaultGallery.category);
    return found ? {
      ...defaultGallery,
      ...found,
      images: Array.isArray(found.images) ? found.images : []
    } : defaultGallery;
  });
}

function renderPortfolio() {
  if (!portfolioGrid) return;

  const galleries = activeFilter === "All"
    ? portfolioGalleries
    : portfolioGalleries.filter(gallery => gallery.category === activeFilter);

  if (!galleries.length) {
    portfolioGrid.innerHTML = `
      <article class="portfolio-empty">
        <h3>No Gallery Found</h3>
        <p>This style does not have an approved gallery yet.</p>
      </article>
    `;
    return;
  }

  portfolioGrid.innerHTML = galleries.map((gallery, index) => {
    const cover = gallery.coverImage || gallery.images?.[0]?.image || "";
    const style = cover ? `style="background-image:url('${escapeHtml(cover)}')"` : "";

    return `
      <article class="portfolio-card" role="button" tabindex="0" data-gallery-index="${portfolioGalleries.indexOf(gallery)}">
        <div class="portfolio-card-image" ${style}></div>
        <div class="portfolio-card-info">
          <span>${escapeHtml(gallery.category)}</span>
          <h3>${escapeHtml(gallery.title || gallery.category)}</h3>
          <p>${escapeHtml(gallery.description || "Open this style gallery.")}</p>
        </div>
      </article>
    `;
  }).join("");

  $$(".portfolio-card", portfolioGrid).forEach(card => {
    const open = () => {
      const index = Number(card.dataset.galleryIndex);
      openGallery(index, 0);
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

galleryFilters.forEach(button => {
  button.addEventListener("click", () => {
    galleryFilters.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter || "All";
    renderPortfolio();
  });
});

/* Gallery modal */
const lightbox = $(".lightbox");
const lightboxImage = $(".lightbox-image");
const lightboxCategory = $(".lightbox-category");
const lightboxTitle = $(".lightbox-content h3");
const lightboxDescription = $(".lightbox-content p");
const lightboxClose = $(".lightbox-close");
const galleryPrev = $(".gallery-prev");
const galleryNext = $(".gallery-next");
const galleryCounter = $(".gallery-counter");
const galleryThumbs = $(".gallery-thumbs");

function getGalleryImages(gallery) {
  const images = Array.isArray(gallery?.images) ? gallery.images.filter(item => item.image) : [];

  if (images.length) return images;

  if (gallery?.coverImage) {
    return [{
      image: gallery.coverImage,
      title: gallery.title || gallery.category,
      description: gallery.description || ""
    }];
  }

  return [];
}

function openGallery(galleryIndex, imageIndex = 0) {
  activeGallery = portfolioGalleries[galleryIndex];
  activeImageIndex = imageIndex;

  if (!activeGallery || !lightbox) return;

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  renderActiveGalleryImage();
}

function closeGallery() {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function renderActiveGalleryImage() {
  if (!activeGallery) return;

  const images = getGalleryImages(activeGallery);
  const hasImages = images.length > 0;
  const current = hasImages ? images[activeImageIndex] : null;

  if (lightboxCategory) lightboxCategory.textContent = activeGallery.category || "";
  if (lightboxTitle) lightboxTitle.textContent = current?.title || activeGallery.title || activeGallery.category || "";
  if (lightboxDescription) {
    lightboxDescription.textContent = current?.description || activeGallery.description || "This gallery is ready for images from the admin panel.";
  }

  if (lightboxImage) {
    if (current?.image) {
      lightboxImage.src = current.image;
      lightboxImage.alt = current.title || activeGallery.title || activeGallery.category || "Tattoo gallery image";
      lightboxImage.style.display = "block";
    } else {
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
      lightboxImage.style.display = "none";
    }
  }

  if (galleryCounter) {
    galleryCounter.textContent = hasImages ? `${activeImageIndex + 1} / ${images.length}` : "No images uploaded yet";
  }

  if (galleryPrev) galleryPrev.style.display = images.length > 1 ? "flex" : "none";
  if (galleryNext) galleryNext.style.display = images.length > 1 ? "flex" : "none";

  if (galleryThumbs) {
    galleryThumbs.innerHTML = images.map((item, index) => `
      <button class="gallery-thumb ${index === activeImageIndex ? "active" : ""}" type="button" data-thumb-index="${index}" aria-label="Open image ${index + 1}">
        <img src="${escapeHtml(item.image)}" alt="">
      </button>
    `).join("");

    $$(".gallery-thumb", galleryThumbs).forEach(thumb => {
      thumb.addEventListener("click", () => {
        activeImageIndex = Number(thumb.dataset.thumbIndex);
        renderActiveGalleryImage();
      });
    });
  }
}

function showNextImage() {
  if (!activeGallery) return;
  const images = getGalleryImages(activeGallery);
  if (images.length <= 1) return;

  activeImageIndex = (activeImageIndex + 1) % images.length;
  renderActiveGalleryImage();
}

function showPrevImage() {
  if (!activeGallery) return;
  const images = getGalleryImages(activeGallery);
  if (images.length <= 1) return;

  activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
  renderActiveGalleryImage();
}

if (lightboxClose) lightboxClose.addEventListener("click", closeGallery);
if (galleryNext) galleryNext.addEventListener("click", showNextImage);
if (galleryPrev) galleryPrev.addEventListener("click", showPrevImage);

if (lightbox) {
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeGallery();
  });
}

document.addEventListener("keydown", event => {
  if (!lightbox?.classList.contains("active")) return;

  if (event.key === "Escape") closeGallery();
  if (event.key === "ArrowRight") showNextImage();
  if (event.key === "ArrowLeft") showPrevImage();
});

async function loadPortfolioGalleries() {
  const galleryFiles = [
    "data/galleries/black-grey-piece.json",
    "data/galleries/fine-line-detail.json",
    "data/galleries/micro-realism.json",
    "data/galleries/realism.json",
    "data/galleries/color.json",
    "data/galleries/other.json"
  ];

  try {
    const responses = await Promise.all(
      galleryFiles.map(file =>
        fetch(file, { cache: "no-store" }).then(response => {
          if (!response.ok) throw new Error(`Gallery file not found: ${file}`);
          return response.json();
        })
      )
    );

    portfolioGalleries = mergeWithFallback(responses);
  } catch (error) {
    try {
      const response = await fetch("data/portfolio.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Portfolio data not found");

      const data = await response.json();
      portfolioGalleries = mergeWithFallback(normalizePortfolioData(data));
    } catch (fallbackError) {
      portfolioGalleries = [...fallbackGalleries];
    }
  }

  renderPortfolio();
}

loadPortfolioGalleries();

/* Approved client reviews */
const reviewsList = $("#reviewsList");

function renderStars(rating) {
  const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function renderReviews(reviews = []) {
  if (!reviewsList) return;

  const approvedReviews = reviews.filter(review => review.approved === true);

  if (!approvedReviews.length) {
    reviewsList.innerHTML = `
      <article class="review-card review-placeholder">
        <span class="review-stars">★★★★★</span>
        <p>Approved client reviews will appear here.</p>
        <strong>Linz Tattoo</strong>
      </article>
    `;
    return;
  }

  reviewsList.innerHTML = approvedReviews.map(review => `
    <article class="review-card">
      <span class="review-stars">${escapeHtml(renderStars(review.rating))}</span>
      <p>“${escapeHtml(review.review || "")}”</p>
      <strong>${escapeHtml(review.name || "Client")}</strong>
      ${review.style ? `<small>${escapeHtml(review.style)}</small>` : ""}
    </article>
  `).join("");
}

async function loadReviews() {
  if (!reviewsList) return;

  try {
    const response = await fetch("data/reviews.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Reviews file not found");

    const data = await response.json();
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    renderReviews(reviews);
  } catch (error) {
    renderReviews([]);
  }
}

loadReviews();


/* Artist biography safe reveal */
document.addEventListener("DOMContentLoaded", () => {
  const artistBioBox = document.querySelector(".artist-bio-box");
  if (!artistBioBox) return;

  const bioParagraphs = Array.from(artistBioBox.querySelectorAll("p"));

  bioParagraphs.forEach((paragraph, index) => {
    paragraph.style.setProperty("--bio-delay", index);
  });

  document.body.classList.add("bio-reveal-ready");

  const showBio = () => {
    artistBioBox.classList.add("bio-visible");
  };

  /* If the bio is already on screen, show it quickly instead of leaving it hidden */
  const rect = artistBioBox.getBoundingClientRect();
  const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

  if (alreadyVisible) {
    setTimeout(showBio, 180);
    return;
  }

  if ("IntersectionObserver" in window) {
    const bioObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          showBio();
          bioObserver.unobserve(artistBioBox);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    bioObserver.observe(artistBioBox);
  } else {
    showBio();
  }
});
