document.addEventListener("DOMContentLoaded", () => {
  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById("navbar");
  window.addEventListener(
    "scroll",
    () => {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    },
    { passive: true },
  );

  /* ══════════════════════════════════════════
     LOADER
     Fix: localStorage.getItem returns null (not
     false) when unset. Use a proper check.
     ══════════════════════════════════════════ */
  const loader = document.getElementById("loader");
  const mainEl = document.getElementById("main-content");
  const navLinks = document.querySelectorAll(".nav-link");

  function showPage() {
    loader.classList.add("hidden");
    mainEl.classList.remove("page-hidden");
    mainEl.classList.add("page-visible");
    initReveal(); // start scroll-reveal after page is visible
  }

  // Mark that user has already seen the loader this session
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sessionStorage.setItem("loaderSeen", "1");
    });
  });

  const alreadySeen = sessionStorage.getItem("loaderSeen");

  let pageShown = false;
  const revealPage = () => {
    if (pageShown) return;
    pageShown = true;
    if (maxWaitId !== null) clearTimeout(maxWaitId);
    showPage();
  };

  /** Images that block the loader: eager/default only. Lazy images are off-screen and may never fire load until scroll — waiting on them stuck the loader forever. */
  function blockingImages() {
    return [...mainEl.querySelectorAll("img")].filter(
      (img) => img.getAttribute("loading") !== "lazy",
    );
  }

  function blockingImagesReady() {
    const imgs = blockingImages();
    if (imgs.length === 0) return true;
    return imgs.every((img) => {
      if (!img.complete) return false;
      // Broken / missing file: complete but no pixels — don't block forever
      if (img.naturalWidth === 0 && img.naturalHeight === 0) return true;
      return img.naturalWidth > 0;
    });
  }

  let maxWaitId = null;

  if (alreadySeen) {
    revealPage();
  } else {
    maxWaitId = setTimeout(() => revealPage(), 4000);

    function waitForImages() {
      if (blockingImagesReady()) {
        revealPage();
      } else if (!pageShown) {
        setTimeout(waitForImages, 200);
      }
    }

    waitForImages();
  }

  /* ══════════════════════════════════════════
     HERO SLIDER
     ══════════════════════════════════════════ */
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  let currentSlide = 0;
  let autoTimer;

  function goToSlide(index) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  function startAuto() {
    autoTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
      resetAuto();
    });
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      goToSlide(currentSlide + 1);
      resetAuto();
    });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAuto();
    });
  });

  startAuto();

  /* ══════════════════════════════════════════
     SCROLL REVEAL
     ══════════════════════════════════════════ */
  function initReveal() {
    const revealEls = document.querySelectorAll(
      ".reveal-left, .reveal-right, .reveal-up",
    );

    if (!("IntersectionObserver" in window)) {
      // Fallback: just show everything
      revealEls.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ══════════════════════════════════════════
     PRODUCT GALLERY SWAP
     ══════════════════════════════════════════ */
  const galleryMain = document.getElementById("galleryMain");
  const galleryThumbs = document.querySelectorAll(".gallery-thumb");

  if (galleryMain && galleryThumbs.length) {
    const mainImg = galleryMain.querySelector("img");

    galleryThumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        // Swap main image src with the thumb's img src
        const thumbImg = thumb.querySelector("img");
        const tempSrc = mainImg.src;
        const tempAlt = mainImg.alt;

        mainImg.src = thumbImg.src;
        mainImg.alt = thumbImg.alt;

        thumbImg.src = tempSrc;
        thumbImg.alt = tempAlt;

        galleryThumbs.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  }

  /* ══════════════════════════════════════════
     SEARCH — hero to search page
     ══════════════════════════════════════════ */
  const searchInput = document.getElementById("search");
  const searchBtn = document.getElementById("search-btn");

  function doSearch() {
    const val = searchInput?.value.trim();
    if (val) {
      sessionStorage.setItem("heroSearch", val);
      sessionStorage.setItem("loaderSeen", "1");
      window.location.href = "search.html";
    }
  }

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  searchBtn?.addEventListener("click", doSearch);

  /* ══════════════════════════════════════════
     SEARCH PLACEHOLDER — responsive
     ══════════════════════════════════════════ */
  function updatePlaceholder() {
    if (!searchInput) return;
    searchInput.placeholder =
      window.innerWidth < 640
        ? "Enter a location…"
        : "City, Province, or Region…";
  }

  updatePlaceholder();
  window.addEventListener("resize", updatePlaceholder, { passive: true });
});
