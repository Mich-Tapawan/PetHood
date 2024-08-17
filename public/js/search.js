document.addEventListener('DOMContentLoaded', ()=>{
    let screenWidth = window.innerWidth; 
    let location = document.querySelector('#search');
    let mapContainer = document.querySelector('.map-container');
    placeholderChanger();
    displayMap();   

    window.addEventListener('resize', ()=>{
        placeholderChanger();
        displayMap();   
    });

    // Search Placeholder Changer
    function placeholderChanger(){
        screenWidth = window.innerWidth;
        if(screenWidth < 768){
            location.placeholder = 'Enter a location...';
        }
        else{
            location.placeholder ='Enter a location (e.g. City, Province, Region)';
        }
    }

    function displayMap(){
        screenWidth = window.innerWidth;
        if(screenWidth < 768){
            mapContainer.style.display = 'none';
        }
        else{
            mapContainer.style.display = 'block';
        }
    }
})