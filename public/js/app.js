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
const searchNoneText = document.querySelector('#search-none h2');
const cardCol = document.querySelector('.card-col');
const mapCol = document.querySelector('.map-container');
const returnBtn = document.querySelector('#return-btn');
const loader = document.querySelector('.loader-container');
const favBtn = document.querySelector('#favorites');
const favContainer = document.querySelector('.favorites-container');
const favList = document.querySelector('#fav-list');
let screenWidth = window.innerWidth;
let isClicked = false;
let favClicked = true;
let locSaved = false;

// Initialize map
var map = L.map('map').setView([12.8797, 121.7740], 5);
map.setMinZoom(5);
map.dragging.disable();
    
// Use open street map layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Initialize customized marker design
var pawIcon = L.icon({
    iconUrl: 'assets/redPaw.png',
    iconSize:     [36, 48],
    popupAnchor:  [-3, -76]
});

if(screenWidth < 768){
    mapCol.style.display = 'none';
}

//Activate search from index or main page
if(localStorage.getItem('heroSearch')){
    searchInput.value = localStorage.getItem('heroSearch');
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
        favContainer.style.display = 'none';
        favBtn.style.color = 'white';
        favBtn.style.background = '#904646';
        favBtn.style.border = 'none';
        favClicked = true;
         //Resets the result list and the map markers
        while (resultList.firstChild) {
            resultList.removeChild(resultList.firstChild);
            }
        for(const marker of currentMarkers){
            map.removeLayer(marker);
        }
        map.flyTo([12.8797, 121.7740], 5);
        fetchAll(searchInput)

        screenWidth = window.innerWidth;
        if(screenWidth <= 758){
            mapCol.style.display = 'none';
            cardCol.style.display = 'block';
        }
    }
})

let emptyCounter = 0;
function fetchAll(searchInput){
    let queries = ['Pet shop, ', 'Grooming, ', 'Pet School', 'Veterinary clinic, '];

    for(query of queries){
        let entry = query + searchInput.value + ' , Philippines';
        fetchLocations(entry);
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
        screenWidth = window.innerWidth;
        if(screenWidth <= 758){
            mapCol.style.display = 'none';
            cardCol.style.display = 'block';
        }
        map.flyTo([12.8797, 121.7740], 5);
    })
})

// fetch data of location from users 
async function fetchLocations(query){
    loader.classList.replace('d-none', 'd-flex');
    searchNone.classList.replace('d-flex', 'd-none');
    resultText.style.display = 'none';

    try{
        let commaIndex = query.indexOf(',');
        let selectedType = query.slice(0, commaIndex);

        let result = await fetch(`https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=${query}`);
        let parsedResult = await result.json();
        if(parsedResult.length === 0){
            //Displays search-empty for empty result
            emptyCounter++;
            if(emptyCounter == 4){
                searchNone.classList.replace('d-none', 'd-flex');
                searchNoneText.innerHTML = 'THERE IS NO SUCH PLACE OR RESULT';
                resultList.style.display = 'none';
                resultText.style.display = 'none';
                emptyCounter = 0;
            }
            return
        }
        else{
            let userID = localStorage.getItem('userID');
            setMapList(parsedResult, selectedType, userID);
        }
        
    }
    catch(error){
        console.error(error);
    }
    finally{
        loader.classList.replace('d-flex', 'd-none');
    }
}

function setMapList(list, type, userID){
    resultList.style.display = 'flex';

    for(const location of list){
        let {li, img, span} = createCards(location, type, false);
        let notMarked = true;

        // Set currently viewed location 
        li.addEventListener('click', ()=>{
            cardClicked(resultList, li, img);
            const clickedLocation = JSON.parse(span.innerHTML);
            localStorage.setItem('locationInfo', JSON.stringify(clickedLocation));
            const position = new L.LatLng(clickedLocation.lat, clickedLocation.lon);
            locName.style.display = 'block';
            address.style.display = 'block';
            locName.innerHTML = clickedLocation.displayName;
            address.innerHTML = clickedLocation.address;
            map.flyTo(position, 19);

            isClicked = true;
            displayContainer(isClicked);
            bookmarkPosition();
            updateBookmarks(userID, location, img)      
        });

        // Bookmark icon toggling and sending JSON data to server
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents triggering the li click event
            let location = JSON.parse(localStorage.getItem('locationInfo'));
            if(notMarked === false || locSaved === true){
                img.src = 'assets/bookmark.png';
                notMarked = true;
            }
            else{
                img.src = 'assets/bookmark-fill.png';
                notMarked = false;
                }
            sendLocationData(userID, location, notMarked, type);
        });

        const position = new L.LatLng(location.lat, location.lon);
        currentMarkers.push(new L.marker(position, {icon: pawIcon}).addTo(map));
        resultList.appendChild(li);
        resultText.style.display = 'block';
        searchIndicator.innerHTML = searchInput.value;
        searchNone.classList.replace('d-flex', 'd-none');
        map.dragging.enable();
    }
}

function createCards(location, type, forBookmark){
    let screenWidth = window.innerWidth;
    const li = document.createElement('li');
    const h2 = document.createElement('h2');
    const h5 = document.createElement('h5');
    const p = document.createElement('p');
    const span = document.createElement('span');
    const img = document.createElement('img');

    li.classList.add('list-group-item', 'list-group-item-action');
    li.style.minHeight = '150px';
    li.style.padding = '20px';
    li.style.marginBottom = '20px';
    li.style.cursor = 'pointer';

    h2.style.color = '#904646';
    h2.style.marginBottom = '20px';
    h2.style.width = '90%';
    h5.style.color = '#000000';
    p.style.fontSize = '1rem';

    img.src = 'assets/bookmark.png';
    img.style.position = 'absolute';
    img.style.width = '50px';
    if(screenWidth < 500){
        img.style.left = '86%';
    }
    else{
        img.style.left = '89%';
    }
    img.style.bottom = '70%';
    img.style.display = 'none';

    if(forBookmark){
        span.innerHTML = JSON.stringify({
            displayName: location.shop_name,
            address: location.address,
            lat: location.lat,
            lon: location.lon
        }, undefined, 2);
    }
    else{
        span.innerHTML = JSON.stringify({
            displayName: location.name,
            address: location.display_name,
            lat: location.lat,
            lon: location.lon
        }, undefined, 2);
    }

    li.appendChild(h2);
    li.appendChild(img);
    li.appendChild(h5);
    li.appendChild(p);
    li.appendChild(span);

    const info = JSON.parse(span.innerHTML);
    h2.textContent = info.displayName;
    h5.textContent = 'Type: '+ type;
    p.textContent = info.address;
    span.style.display = 'none';

    return {li, img, span}
};

function cardClicked(list, li, img){
    // Set styling on clicked location card
    for(const child of list.children) {
        child.querySelector('h2').style.color = '#904646';
        child.querySelector('p').style.color = '#000000';
        child.querySelector('h5').style.color = '#000000';
        child.querySelector('img').style.display = 'none';
        child.style.background = '#ffffff';
    }
    li.querySelector('h2').style.color = '#ffffff';
    li.querySelector('h5').style.color = '#ffffff';
    li.querySelector('p').style.color = '#ffffff';
    li.style.background = '#904646';
    img.style.display = 'block';
                
    // Prevents off-window text content inside the map container
    if(mapCol.offsetHeight > 600){
        locName.style.fontSize = '1.8rem';
        address.style.fontSize = '1.1rem';
    }
    else{
        locName.style.fontSize = '2rem';
        address.style.fontSize = '1.3rem';
    }
};

returnBtn.addEventListener('click', ()=>{
    mapCol.style.display = 'none';
    cardCol.style.display = 'block';
})

window.addEventListener('resize', ()=>{
    displayContainer(isClicked);  
})

function displayContainer(isClicked){
    screenWidth = window.innerWidth;
    if(screenWidth < 768){
        if(isClicked){
            cardCol.style.display = 'none';
            mapCol.style.display = 'block';
            mapCol.style.width = '95%';
            returnBtn.style.display = 'block';
        }
        else{
            mapCol.style.display = 'none';
        }
    }
    else{
        cardCol.style.display = 'block';
        mapCol.style.display = 'block';
        mapCol.style.width = '41%';
        returnBtn.style.display = 'none';
    }
}

function bookmarkPosition(){
    let screenWidth = window.innerWidth;
    if(screenWidth < 992){
        img.style.left = '88%';
    }
}

async function sendLocationData(userID, data, notMarked, type){
    try{
        let response = await fetch('https://pethood.onrender.com/getUser', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({userID: userID, favorite: data, state: notMarked, type: type})
        })
        let result = await response.json();
    }
    catch(error){
        console.error(error);
    }
}

// Favorites Section

favBtn.addEventListener('click', ()=>{
    let userID = localStorage.getItem('userID');

    //Resets the result list and the map markers
    while (favList.firstChild) {
        favList.removeChild(favList.firstChild);
        }
            
    for(const marker of currentMarkers){
        map.removeLayer(marker);
    }
    if(favClicked === true){
        favContainer.style.display = 'block';
        favBtn.style.color = '#904646';
        favBtn.style.background = '#FFD18D';
        favBtn.style.border = '1px solid #904646';
        getFavorites(userID)
    }
    else{
        favContainer.style.display = 'none';
        favBtn.style.color = 'white';
        favBtn.style.background = '#904646';
        favBtn.style.border = 'none';
        searchNone.classList.replace('d-none','d-flex');
    }
    resultList.style.display = 'none';
    resultText.style.display = 'none';
    searchIndicator.style.display = 'none';
    favClicked = !favClicked;
})

async function getFavorites(userID) {
    loader.classList.replace('d-none', 'd-flex');
    searchNone.classList.replace('d-flex', 'd-none');
    let types = [];

    try{
        let response = await fetch('https://pethood.onrender.com/getFavorites',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({userID:userID})
        });
        let result = await response.json();
        for(let record of result){
            types.push(record.type);
        }
        displayFavorites(result, types)
    }
    catch(error){
        console.error(error);
    }
    finally{
        loader.classList.replace('d-flex', 'd-none');
    }
}

function displayFavorites(list, types){
    favList.style.display = 'flex';
    let typeCounter = 0;

    for(const location of list){
        let {li, img, span} = createCards(location, types[typeCounter], true);

        // Set currently viewed location 
        li.addEventListener('click', ()=>{
            cardClicked(favList, li, img);
            const clickedLocation = JSON.parse(span.innerHTML);
            localStorage.setItem('locationInfo', JSON.stringify(clickedLocation));
            const position = new L.LatLng(clickedLocation.lat, clickedLocation.lon);
            locName.style.display = 'block';
            address.style.display = 'block';
            locName.innerHTML = clickedLocation.displayName;
            address.innerHTML = clickedLocation.address;
            map.flyTo(position, 19);
            img.src = 'assets/bookmark-fill.png';
            isClicked = true;
            displayContainer(isClicked);
            bookmarkPosition();      
        });

        // Bookmark icon toggling and sending JSON data to server
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents triggering the li click event
            let location = JSON.parse(localStorage.getItem('locationInfo'));
            let userID = localStorage.getItem('userID');
            sendLocationData(userID, location, true, types[typeCounter]);
            favList.removeChild(li);
        });

        const position = new L.LatLng(location.lat, location.lon);
        currentMarkers.push(new L.marker(position, {icon: pawIcon}).addTo(map));
        favList.appendChild(li);
        searchNone.classList.replace('d-flex', 'd-none');
        map.dragging.enable();
        typeCounter++;
    }
}

async function updateBookmarks(userID, location, img){
    try{
        let saved = await isSaved(userID, location, img);
        if( saved === true){
            img.src = 'assets/bookmark-fill.png'
            locSaved = true;
        }
        else{
            img.src = 'assets/bookmark.png';
            locSaved = false;
        }
    }
    catch(error){
        console.error(error)
    }
} 

//Updates bookmark card icon during search
async function isSaved(userID, location, img) {
    try{
        let response = await fetch('https://pethood.onrender.com/getFavorites',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({userID:userID})
        });
        let result = await response.json();

        for(let savedLoc of result){
            if(savedLoc.shop_name === location.name){ 
                img.src = 'assets/bookmark-fill.png';
                return true;
            }
        }
        return false;
    }
    catch(error){
        console.error(error);
    }
}