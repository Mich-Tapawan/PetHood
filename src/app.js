
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
    fetchAll(searchInput)
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
         //Resets the result list and the map markers
        while (resultList.firstChild) {
            resultList.removeChild(resultList.firstChild);
            }
        for(const marker of currentMarkers){
            map.removeLayer(marker);
        }
        
        fetchAll(searchInput)
    }
})

function fetchAll(searchInput){
    let queries = ['Pet shop, ', 'Grooming, ', 'Pet training', 'Veterinary clinic, '];
    let emptyCounter = 0;

    for(query of queries){
        let entry = query + searchInput.value + ' , Philippines';
        let execute = fetchLocations(entry);

        if (execute === '0'){
            emptyCounter++;
        }

        if(emptyCounter === queries.length){
            searchNone.style.display = 'block';
            resultList.style.display = 'none';
            resultText.style.display = 'none';
        }
    }
}

// filtering types
const types = document.querySelectorAll('.dropdown-item');
types.forEach( btn =>{
    btn.addEventListener('click', ()=>{

        //Resets the result list and the map markers
        while (resultList.firstChild) {
            resultList.removeChild(resultList.firstChild);
            }
        
        for(const marker of currentMarkers){
            map.removeLayer(marker);
        }

        if(btn.dataset.type != "All"){
            let value = btn.dataset.type + ', ';
            let query = value + searchInput.value + ' , Philippines'
            fetchLocations(query);
        }
        else{
            fetchAll(searchInput);
        }
    })
})

// fetch data of location from users 
async function fetchLocations(query){
    try{
        let commaIndex = query.indexOf(',');
        let selectedType = query.slice(0, commaIndex);

        let result = await fetch(`https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=${query}`);
        let parsedResult = await result.json();
        if(parsedResult.length === 0){
            return 0
        }
        else{
            setMapList(parsedResult, selectedType);
        }
        
    }
    catch(error){
        console.error(error);
    }
}

function setMapList(list, type){
    resultList.style.display = 'flex';

    for(const location of list){
        const li = document.createElement('li');
        const h2 = document.createElement('h2');
        const h5 = document.createElement('h5');
        const p = document.createElement('p');
        const span = document.createElement('span');

        li.classList.add('list-group-item', 'list-group-item-action');
        li.style.minHeight = '150px';
        li.style.padding = '20px';
        li.style.marginBottom = '20px';
        li.style.cursor = 'pointer';

        h2.style.color = '#904646';
        h2.style.marginBottom = '20px';
        h5.style.color = '#000000';
        p.style.fontSize = '1rem';

        span.innerHTML = JSON.stringify({
            displayName: location.name,
            address: location.display_name,
            lat: location.lat,
            lon: location.lon
        }, undefined, 2);

        li.appendChild(h2);
        li.appendChild(h5);
        li.appendChild(p);
        li.appendChild(span);

        const info = JSON.parse(span.innerHTML);
        h2.textContent = info.displayName;
        h5.textContent = 'Type: '+ type;
        p.textContent = info.address;
        span.style.display = 'none';

        // Set currently viewed location 
        li.addEventListener('click', (event)=>{

            // Set styling on clicked location card
            for(const child of resultList.children) {
                child.querySelector('h2').style.color = '#904646';
                child.querySelector('p').style.color = '#000000';
                child.querySelector('h5').style.color = '#000000';
                child.style.background = '#ffffff';
            }
            li.querySelector('h2').style.color = '#ffffff';
            li.querySelector('h5').style.color = '#ffffff';
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