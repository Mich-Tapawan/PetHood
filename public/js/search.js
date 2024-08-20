document.addEventListener('DOMContentLoaded', ()=>{
    let screenWidth = window.innerWidth; 
    let location = document.querySelector('#search');
    placeholderChanger();
    checkUser();

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

    function generateUser(){
        return Date.now();
    }

    function checkUser(){
        let userID = localStorage.getItem('userID');

        if(!userID){
            let id = generateUser();
            userID = localStorage.setItem('userID', id);
        }

        return userID;
    }
});