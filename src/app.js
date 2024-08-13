
//Display the name of the store, type, and full address to each card

const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const resultList = document.getElementById('result-list');
const mapContainer = document.getElementById('map');
const currentMarkers = [];

const resultText = document.querySelector('.card-col p');
const searchIndicator = document.getElementById('search-indicator');
const locName = document.getElementById('loc-name');
const address = document.getElementById('loc-add');
const searchNone = document.getElementById('search-none');

// Initialize map
var map = L.map('map').setView([12.8797, 121.7740], 5);
map.setMinZoom(5);
map.dragging.disable();
    
// Use open street map layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Activate search from index or main page
if(localStorage.getItem('heroSearch')){
    searchInput.value = localStorage.getItem('heroSearch');
    console.log(searchInput.value)
    let query = 'pet shop '+ searchInput.value + ' , Philippines'
    fetchLocations(query);
    localStorage.removeItem('heroSearch');
}

// Enter inquiry to search
searchInput.addEventListener('keydown', (event)=>{
    if(event.key === 'Enter'){
        searchBtn.click();
    }
})

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
        if(parsedResult.length === 0){
            searchNone.style.display = 'block';
            resultList.style.display = 'none';
            resultText.style.display = 'none';
            console.log('raws')
        }
        else{
            setMapList(parsedResult);
        }
        
    }
    catch(error){
        console.error(error);
    }
}

function setMapList(list){
    resultList.style.display = 'flex';
    for(const marker of currentMarkers){
        map.removeLayer(marker);
    }

    //Removes all previously searched location results
    while (resultList.firstChild) {
        resultList.removeChild(resultList.firstChild);
    }

    for(const location of list){
        const li = document.createElement('li');
        const h2 = document.createElement('h2');
        const p = document.createElement('p');
        const span = document.createElement('span');

        li.classList.add('list-group-item', 'list-group-item-action');
        li.style.minHeight = '150px';
        li.style.padding = '20px';
        li.style.marginBottom = '20px';
        li.style.cursor = 'pointer';

        h2.style.color = '#904646'
        h2.style.marginBottom = '20px';
        p.style.fontSize = '1rem';

        span.innerHTML = JSON.stringify({
            displayName: location.name,
            address: location.display_name,
            lat: location.lat,
            lon: location.lon
        }, undefined, 2);

        li.appendChild(h2);
        li.appendChild(p);
        li.appendChild(span);

        const info = JSON.parse(span.innerHTML);
        h2.textContent = info.displayName;
        p.textContent = info.address;
        span.style.display = 'none';

        // Set currently viewed location 
        li.addEventListener('click', (event)=>{

            // Set styling on clicked location card
            for(const child of resultList.children) {
                child.querySelector('h2').style.color = '#904646';
                child.querySelector('p').style.color = '#000000';
                child.style.background = '#ffffff';
            }
            li.querySelector('h2').style.color = '#ffffff';
            li.querySelector('p').style.color = '#ffffff';
            li.style.background = '#904646';

            const clickedLocation = JSON.parse(span.innerHTML);
            const position = new L.LatLng(clickedLocation.lat, clickedLocation.lon);
            locName.style.display = 'block';
            address.style.display = 'block';
            locName.innerHTML = clickedLocation.displayName;
            address.innerHTML = clickedLocation.address;
            map.flyTo(position, 19);
        });

        const position = new L.LatLng(location.lat, location.lon);
        currentMarkers.push(new L.marker(position).addTo(map));
        resultList.appendChild(li);
        resultText.style.display = 'block';
        searchIndicator.innerHTML = searchInput.value;
        searchNone.classList.remove('d-flex');
        searchNone.classList.add('d-none');
    }
}