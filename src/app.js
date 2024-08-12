
//Display the name of the store, type, and full address to each card

const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const resultList = document.getElementById('result-list');
const mapContainer = document.getElementById('map');
const currentMarkers = [];
const locName = document.getElementById('loc-name');
const address = document.getElementById('loc-add');

// Initialize map
var map = L.map('map').setView([12.8797, 121.7740], 5);

// Use open street map layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

searchBtn.addEventListener('click', ()=>{
    let query = searchInput.value + ' , Philippines'
    fetchLocations(query);
})

// fetch data of location from users 
async function fetchLocations(query){
    try{
        let result = await fetch(`https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=${query}`);
        let parsedResult = await result.json();
        setMapList(parsedResult);
    }
    catch(error){
        console.error(error);
    }
}

function setMapList(list){
    for(const marker of currentMarkers){
        map.removeLayer(marker);
    }

    map.flyTo(new L.LatLng(12.8797, 121.7740), 2);

    for(const location of list){
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'list-group-item-action');
        li.innerHTML = JSON.stringify({
            displayName: location.name,
            lat: location.lat,
            lon: location.lon
        }, undefined, 2);

        // Set currently viewed location 
        li.addEventListener('click', (event)=>{
            for(const child of resultList){
                child.classList.remove('active');
            }
            event.target.classList.add('active');

            const clickedLocation = JSON.parse(event.target.innerHTML);
            const position = new L.LatLng(clickedLocation.lat, clickedLocation.lon);
            map.flyTo(position, 10);
        });

        const position = new L.LatLng(location.lat, location.lon);
        currentMarkers.push(new L.marker(position).addTo(map));
        resultList.appendChild(li);
    }
}