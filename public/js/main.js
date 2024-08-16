document.addEventListener('DOMContentLoaded', ()=>{

    // Checks if all images are completely rendered
    function checkAllContentLoaded(){
        let content = document.querySelectorAll('main *');
        let allLoaded = true;

        content.forEach(element=>{
            if (element.tagName === 'IMG' && !element.complete) {
                allLoaded = false;
            }
        })

        return allLoaded;
    }

    function initializeContent(){
        
        if(checkAllContentLoaded()){
            document.querySelector('.loader-container').classList.replace('d-flex', 'd-none');
            document.querySelector('main').classList.replace('d-none', 'd-block');
        }
        else{
            setTimeout(initializeContent, 200);
        }
        
    }

    initializeContent()

    let screenWidth = window.innerWidth; 
    var location = document.querySelector('#search');
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

    // Showcase Image Rotation
    let smallerImages = document.querySelectorAll('.small-img img');
    let enlargedImage = document.querySelector('.enlarged-img img');

    smallerImages.forEach(img =>{
        img.addEventListener('click', ()=>{
            let temp = enlargedImage.src;
            enlargedImage.src = img.src
            img.src = temp
        })
    });

    // Save search to local storage
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');

    searchInput.addEventListener('keydown', (event)=>{
        if(event.key === 'Enter'){
            searchBtn.click();
        }
    })
    searchBtn.addEventListener('click', ()=>{
        if(searchInput.value){
            localStorage.setItem('heroSearch', searchInput.value);
            window.location.href = "public/search.html";
        }
    })
});