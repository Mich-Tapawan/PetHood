document.addEventListener('DOMContentLoaded', ()=>{
    let screenWidth = window.innerWidth; 
    let location = document.querySelector('#search');
    placeholderChanger();

    window.addEventListener('resize', ()=>{
        placeholderChanger();
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
})