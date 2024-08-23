document.addEventListener('DOMContentLoaded', ()=>{
    let screenWidth = window.innerWidth; 
    let location = document.querySelector('#search');
    placeholderChanger();
    let user = checkUser();
    let current_date =  Date.now();
    console.log(user, current_date)
    identifyUser(user, current_date);


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

    async function identifyUser(userID, currentDate){
        try{
            let response = await fetch('http://localhost:3000/identifyUser', {
                method:'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({userID:userID, curDate:currentDate})
            });
            let result = await response.json();
            console.log(result);
        }
        catch(err){
            console.error(err);
        }
    }
});