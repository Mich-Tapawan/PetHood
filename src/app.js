
//Display the name of the store, type, and full address to each card

const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const resultText = document.querySelector('.card-col p');
const searchIndicator = document.getElementById('search-indicator');
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
    if(!searchInput.value){
        return
    }
    else{
        let query = 'pet shop '+ searchInput.value + ' , Philippines'
        fetchLocations(query);
    }
})

// fetch data of location from users 
async function fetchLocations(query){
    try{
        let result = await fetch(`https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=${query}`);
        let parsedResult = await result.json();
        console.log(parsedResult)
        console.log(query)
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

    for(const location of list){
        const li = document.createElement('li');
        const h2 = 
        li.classList.add('list-group-item', 'list-group-item-action');
        li.style.cursor = 'pointer';

        li.innerHTML = JSON.stringify({
            displayName: location.name,
            address: location.display_name,
            lat: location.lat,
            lon: location.lon
        }, undefined, 2);

        // Set currently viewed location 
        li.addEventListener('click', (event)=>{
            for(const child of resultList.children) {
                child.classList.remove('active');
            }
            event.target.classList.add('active');

            const clickedLocation = JSON.parse(event.target.innerHTML);
            const position = new L.LatLng(clickedLocation.lat, clickedLocation.lon);
            locName.innerHTML = clickedLocation.displayName;
            address.innerHTML = clickedLocation.address;
            map.flyTo(position, 19);
        });

        const position = new L.LatLng(location.lat, location.lon);
        currentMarkers.push(new L.marker(position).addTo(map));
        resultList.appendChild(li);
        resultText.style.display = 'block';
        searchIndicator.innerHTML = searchInput.value;
    }
}