document.addEventListener("DOMContentLoaded", () => {
  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById("navbar");
  const navbarNav = document.getElementById("navbarNav");
  const DEFAULT_NAV_H = "72px";

  /**
   * Keep --nav-h in sync for the fixed search strip.
   * When the mobile menu is open, --nav-h is the full expanded navbar.
   * When collapsed, reset to the top bar only (never trap min-height on the nav itself).
   */
  function syncNavHeight() {
    if (!navbar) return;

    if (window.innerWidth >= 992) {
      document.documentElement.style.setProperty("--nav-h", DEFAULT_NAV_H);
      return;
    }

    const isOpen = navbarNav?.classList.contains("show");
    if (isOpen) {
      document.documentElement.style.setProperty(
        "--nav-h",
        `${navbar.offsetHeight}px`,
      );
    } else {
      // Force default first so a stale expanded value can't inflate the measurement
      document.documentElement.style.setProperty("--nav-h", DEFAULT_NAV_H);
      document.documentElement.style.setProperty(
        "--nav-h",
        `${navbar.offsetHeight}px`,
      );
    }
  }

  syncNavHeight();
  window.addEventListener("resize", syncNavHeight, { passive: true });

  navbarNav?.addEventListener("shown.bs.collapse", syncNavHeight);
  navbarNav?.addEventListener("hidden.bs.collapse", syncNavHeight);

  window.addEventListener(
    "scroll",
    () => {
      navbar?.classList.toggle("scrolled", window.scrollY > 40);
    },
    { passive: true },
  );

  /* ── Mobile nav: keep search strip below collapsed nav ── */
  const burgerIcon = document.querySelector(".navbar-toggler");
  const searchStrip = document.getElementById("search-container");

  burgerIcon?.addEventListener("click", () => {
    // Z-index only here — height sync waits for Bootstrap shown/hidden events
    setTimeout(() => {
      const navOpen = document.querySelector("#navbarNav.show");
      if (searchStrip) {
        searchStrip.style.zIndex = navOpen ? "1010" : "1020";
      }
    }, 50);
  });

  /* ── Responsive placeholder ── */
  const searchInput = document.getElementById("search");

  function updatePlaceholder() {
    if (!searchInput) return;
    searchInput.placeholder =
      window.innerWidth < 640
        ? "Enter a location…"
        : "Enter a location (e.g. City, Province, Region)";
  }

  updatePlaceholder();
  window.addEventListener("resize", updatePlaceholder, { passive: true });

  /* ── Restore search from hero ── */
  const savedSearch = sessionStorage.getItem("heroSearch");
  if (savedSearch && searchInput) {
    searchInput.value = savedSearch;
    sessionStorage.removeItem("heroSearch");
    // Trigger search automatically
    document.getElementById("search-btn")?.click();
  }

  /* ── Filter label update ── */
  const filterLabel = document.getElementById("filter-label");
  const dropdownItems = document.querySelectorAll(".dropdown-item[data-type]");

  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (filterLabel) {
        filterLabel.textContent =
          item.textContent.trim() === "All"
            ? "All Types"
            : item.textContent.trim();
      }
    });
  });

  /* ══════════════════════════════════════════
     USER IDENTIFICATION
     Moved to a self-contained function.
     Uses sessionStorage so the API isn't hit
     on every tab refresh.
     ══════════════════════════════════════════ */
  function getOrCreateUserID() {
    let id = localStorage.getItem("userID");
    if (!id) {
      id = String(Date.now());
      localStorage.setItem("userID", id);
    }
    return id;
  }

  async function identifyUser() {
    // Only identify once per session to avoid hammering the endpoint
    if (sessionStorage.getItem("userIdentified")) return;

    const userID = getOrCreateUserID();

    try {
      const response = await fetch(
        "https://pethood.onrender.com/identifyUser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, curDate: Date.now() }),
        },
      );

      if (response.ok) {
        sessionStorage.setItem("userIdentified", "1");
      }
    } catch (err) {
      // Non-critical — silently fail
      console.warn("User identification failed:", err.message);
    }
  }

  identifyUser();
});
