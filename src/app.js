/* 
- If search bar is empty, then dont display map
- Collect user input from search
- on click, fetch nominatim api with the additional query of ' , Philippines' (use async await)
- Parse returned json file
- Display the name of the store, type, and full address to each card
*/

const searchInput = document.getElementById('search');
const resultList = document.getElementById('result-list');
const mapContainer = document.getElementById('map');
const currentMarkers = [];
const locName = document.getElementById('loc-name');
const address = document.getElementById('loc-add');

var map = L.map('map').setView([12.8797, 121.7740], 5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

