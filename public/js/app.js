const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const resultList = document.getElementById("result-list");
const favList = document.getElementById("fav-list");
const resultsLoading = document.getElementById("results-loading");
const resultsHeader = document.getElementById("results-header");
const searchIndicator = document.getElementById("search-indicator");
const searchNone = document.getElementById("search-none");
const favBtn = document.getElementById("favorites");
const favContainer = document.getElementById("favorites-container");
const returnBtn = document.getElementById("return-btn");
const resultsPanel = document.querySelector(".results-panel");
const mapPanel = document.querySelector(".map-panel");
const locName = document.getElementById("loc-name");
const locAdd = document.getElementById("loc-add");
const mapDetail = document.getElementById("map-detail");
const mapWrap = document.getElementById("map-wrap");

const currentMarkers = [];
let isClicked = false; // true when a card has been tapped (mobile)
let favOpen = false; // true when favorites panel is open
let locSaved = false; // true when current card is already bookmarked
let emptyCount = 0; // counts empty sub-queries in fetchAll

/* ════════════════════════════════════════════
   MAP INIT
   ════════════════════════════════════════════ */
const map = L.map("map").setView([12.8797, 121.774], 5);
map.setMinZoom(5);
map.dragging.disable();

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const pawIcon = L.icon({
  iconUrl: "assets/redPaw.png",
  iconSize: [36, 48],
  popupAnchor: [-3, -76],
});

function isMobile() {
  return window.innerWidth < 768;
}

/** Show the results panel, hide map (mobile only after a card click) */
function showResults() {
  if (!isMobile()) return;
  resultsPanel.classList.remove("mobile-hidden");
  mapPanel.classList.add("mobile-hidden");
  returnBtn.style.display = "none";
}

/** Show the map panel, hide results (mobile only, after card click) */
function showMap() {
  if (!isMobile()) return;
  resultsPanel.classList.add("mobile-hidden");
  mapPanel.classList.remove("mobile-hidden");
  returnBtn.style.display = "flex";
}

/** Called on resize — restore desktop layout */
window.addEventListener(
  "resize",
  () => {
    resultsPanel.classList.remove("mobile-hidden");
    mapPanel.classList.remove("mobile-hidden");
    if (!isMobile()) {
      returnBtn.style.display = "none";
    }
  },
  { passive: true },
);

/* ════════════════════════════════════════════
   LOADING STATE
   ════════════════════════════════════════════ */
function showLoading() {
  resultsLoading.classList.remove("d-none");
  resultsLoading.classList.add("d-flex");
  searchNone.style.display = "none";
  resultsHeader.style.display = "none";
}

function hideLoading() {
  resultsLoading.classList.add("d-none");
  resultsLoading.classList.remove("d-flex");
}

/* ════════════════════════════════════════════
   SEARCH — hero passthrough
   ════════════════════════════════════════════ */
const savedSearch = sessionStorage.getItem("heroSearch");
if (savedSearch && searchInput) {
  searchInput.value = savedSearch;
  sessionStorage.removeItem("heroSearch");
  triggerSearch();
}

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

searchBtn.addEventListener("click", triggerSearch);

function triggerSearch() {
  if (!searchInput.value.trim()) return;

  // Reset favorites UI
  closeFavorites();

  // Clear results + markers
  clearResults();
  resetMap();

  fetchAll(searchInput.value.trim());

  if (isMobile()) showResults();
}

/* ════════════════════════════════════════════
   FETCH
   ════════════════════════════════════════════ */
function fetchAll(location) {
  emptyCount = 0;
  const queries = [
    `Pet shop, ${location}, Philippines`,
    `Grooming, ${location}, Philippines`,
    `Pet School, ${location}, Philippines`,
    `Veterinary clinic, ${location}, Philippines`,
  ];
  queries.forEach((q) => fetchLocations(q));
}

async function fetchLocations(query) {
  showLoading();

  try {
    const commaIdx = query.indexOf(",");
    const selectedType = query.slice(0, commaIdx).trim();

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=${encodeURIComponent(query)}`,
    );
    const places = await res.json();

    if (places.length === 0) {
      emptyCount++;
      if (emptyCount === 4) {
        // All 4 sub-queries returned nothing
        showEmptyState("No results found for that location.");
        emptyCount = 0;
      }
      return;
    }

    const userID = localStorage.getItem("userID");
    renderCards(places, selectedType, userID);
  } catch (err) {
    console.error("fetchLocations error:", err);
  } finally {
    hideLoading();
  }
}

/* ════════════════════════════════════════════
   RENDER CARDS
   ════════════════════════════════════════════ */
function renderCards(places, type, userID) {
  resultsHeader.style.display = "block";
  searchIndicator.textContent = searchInput.value;
  searchNone.style.display = "none";

  places.forEach((place) => {
    const { li, bookmarkBtn, dataSpan } = createCard(place, type, false);

    li.addEventListener("click", () => {
      onCardClick(resultList, li, bookmarkBtn);
      const loc = JSON.parse(dataSpan.textContent);
      localStorage.setItem("locationInfo", JSON.stringify(loc));
      showLocationDetail(loc);
      isClicked = true;
      if (isMobile()) showMap();
      updateBookmarkIcon(userID, place, bookmarkBtn);
    });

    bookmarkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const loc = JSON.parse(localStorage.getItem("locationInfo"));
      const saving = bookmarkBtn.dataset.saved !== "true";
      bookmarkBtn.dataset.saved = saving ? "true" : "false";
      bookmarkBtn.classList.toggle("saved", saving);
      sendLocationData(userID, loc, !saving, type);
    });

    const pos = new L.LatLng(place.lat, place.lon);
    currentMarkers.push(L.marker(pos, { icon: pawIcon }).addTo(map));
    resultList.appendChild(li);
    map.dragging.enable();
  });
}

/* ════════════════════════════════════════════
   CREATE CARD ELEMENT
   ════════════════════════════════════════════ */
function createCard(location, type, isBookmark) {
  const li = document.createElement("li");
  const nameEl = document.createElement("h3");
  const typeEl = document.createElement("span");
  const addressEl = document.createElement("p");
  const bookmarkBtn = document.createElement("button");
  const dataSpan = document.createElement("span"); // hidden data store

  li.className = "result-card";
  nameEl.className = "result-name";
  typeEl.className = "result-type";
  addressEl.className = "result-address";
  bookmarkBtn.className = "bookmark-btn";
  bookmarkBtn.setAttribute("aria-label", "Bookmark this location");
  dataSpan.hidden = true;

  // Bookmark SVG (outline = unsaved, filled = saved)
  bookmarkBtn.innerHTML = `
    <svg class="bm-outline" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    <svg class="bm-filled"  width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
  `;

  // Populate data span
  if (isBookmark) {
    dataSpan.textContent = JSON.stringify({
      displayName: location.shop_name,
      address: location.address,
      lat: location.lat,
      lon: location.lon,
    });
  } else {
    dataSpan.textContent = JSON.stringify({
      displayName: location.name,
      address: location.display_name,
      lat: location.lat,
      lon: location.lon,
    });
  }

  const info = JSON.parse(dataSpan.textContent);
  nameEl.textContent = info.displayName;
  typeEl.textContent = type;
  addressEl.textContent = info.address;

  li.append(nameEl, typeEl, addressEl, bookmarkBtn, dataSpan);
  return { li, bookmarkBtn, dataSpan };
}

/* ════════════════════════════════════════════
   CARD ACTIVE STATE
   ════════════════════════════════════════════ */
function onCardClick(list, activeLi, bookmarkBtn) {
  list.querySelectorAll(".result-card").forEach((card) => {
    card.classList.remove("active");
    card.querySelector(".bookmark-btn").classList.remove("visible");
  });
  activeLi.classList.add("active");
  bookmarkBtn.classList.add("visible");
}

/* ════════════════════════════════════════════
   LOCATION DETAIL (map panel)
   ════════════════════════════════════════════ */
function showLocationDetail(loc) {
  locName.textContent = loc.displayName;
  locAdd.textContent = loc.address;
  mapDetail.style.display = "block";
  map.flyTo([loc.lat, loc.lon], 19);
}

/* ════════════════════════════════════════════
   RETURN BUTTON (mobile)
   ════════════════════════════════════════════ */
returnBtn.addEventListener("click", () => {
  isClicked = false;
  showResults();
});

/* ════════════════════════════════════════════
   EMPTY / RESET HELPERS
   ════════════════════════════════════════════ */
function showEmptyState(message) {
  searchNone.querySelector("h3").textContent = "Where to, furparent?";
  searchNone.querySelector("p").textContent =
    message ||
    "Enter a city, province, or region to discover pet-friendly spots near you.";
  searchNone.style.display = "flex";
  resultsHeader.style.display = "none";
}

function clearResults() {
  resultList.innerHTML = "";
  favList.innerHTML = "";
}

function resetMap() {
  currentMarkers.forEach((m) => map.removeLayer(m));
  currentMarkers.length = 0;
  map.flyTo([12.8797, 121.774], 5);
  mapDetail.style.display = "none";
}

/* ════════════════════════════════════════════
   FILTER DROPDOWN
   ════════════════════════════════════════════ */
document.querySelectorAll(".dropdown-item[data-type]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!searchInput.value.trim()) return;

    clearResults();
    resetMap();

    if (btn.dataset.type === "All") {
      fetchAll(searchInput.value.trim());
    } else {
      fetchLocations(
        `${btn.dataset.type}, ${searchInput.value.trim()}, Philippines`,
      );
    }

    if (isMobile()) showResults();
  });
});

/* ════════════════════════════════════════════
   FAVORITES
   ════════════════════════════════════════════ */
favBtn.addEventListener("click", () => {
  if (favOpen) {
    closeFavorites();
  } else {
    openFavorites();
  }
});

function openFavorites() {
  favOpen = true;
  favBtn.classList.add("active");
  favContainer.style.display = "block";
  resultList.style.display = "none";
  resultsHeader.style.display = "none";
  searchNone.style.display = "none";

  clearResults();
  resetMap();

  const userID = localStorage.getItem("userID");
  getFavorites(userID);
}

function closeFavorites() {
  favOpen = false;
  favBtn.classList.remove("active");
  favContainer.style.display = "none";
  resultList.style.display = "";
  showEmptyState();
}

async function getFavorites(userID) {
  showLoading();
  try {
    const res = await fetch("https://pethood.onrender.com/getFavorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID }),
    });
    const result = await res.json();
    const types = result.map((r) => r.type);
    displayFavorites(result, types);
  } catch (err) {
    console.error("getFavorites error:", err);
  } finally {
    hideLoading();
  }
}

function displayFavorites(list, types) {
  if (list.length === 0) {
    favContainer.style.display = "none";
    showEmptyState("You haven't saved any favorites yet.");
    return;
  }

  list.forEach((location, i) => {
    const { li, bookmarkBtn, dataSpan } = createCard(location, types[i], true);
    bookmarkBtn.dataset.saved = "true";
    bookmarkBtn.classList.add("saved", "visible");

    li.addEventListener("click", () => {
      onCardClick(favList, li, bookmarkBtn);
      const loc = JSON.parse(dataSpan.textContent);
      localStorage.setItem("locationInfo", JSON.stringify(loc));
      showLocationDetail(loc);
      isClicked = true;
      if (isMobile()) showMap();
    });

    // Clicking bookmark on a favorite removes it
    bookmarkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const loc = JSON.parse(localStorage.getItem("locationInfo"));
      const userID = localStorage.getItem("userID");
      sendLocationData(userID, loc, true, types[i]); // state=true means "remove"
      favList.removeChild(li);
    });

    const pos = new L.LatLng(location.lat, location.lon);
    currentMarkers.push(L.marker(pos, { icon: pawIcon }).addTo(map));
    favList.appendChild(li);
    map.dragging.enable();
  });
}

/* ════════════════════════════════════════════
   BOOKMARK API
   ════════════════════════════════════════════ */
async function sendLocationData(userID, data, notMarked, type) {
  try {
    await fetch("https://pethood.onrender.com/getUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID, favorite: data, state: notMarked, type }),
    });
  } catch (err) {
    console.error("sendLocationData error:", err);
  }
}

async function updateBookmarkIcon(userID, place, bookmarkBtn) {
  try {
    const res = await fetch("https://pethood.onrender.com/getFavorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID }),
    });
    const result = await res.json();
    const saved = result.some((loc) => loc.shop_name === place.name);
    bookmarkBtn.dataset.saved = saved ? "true" : "false";
    bookmarkBtn.classList.toggle("saved", saved);
    locSaved = saved;
  } catch (err) {
    console.error("updateBookmarkIcon error:", err);
  }
}
