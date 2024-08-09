document.addEventListener('DOMContentLoaded', ()=>{
    let screenWidth = window.innerWidth; 
    var location = document.querySelector('#location');
    placeholderChanger();

    window.addEventListener('resize', ()=>{
        placeholderChanger();
    });

    //Search Placeholder Changer
    function placeholderChanger(){
        screenWidth = window.innerWidth;
        if(screenWidth < 768){
            location.placeholder = 'Enter a location...';
        }
        else{
            location.placeholder ='Enter a location (e.g. City, Province, Region)';
        }
    }

    //Showcase Image Rotation
    let smallerImages = document.querySelectorAll('.small-img img');
    let enlargedImage = document.querySelector('.enlarged-img img');

    smallerImages.forEach(img =>{
        img.addEventListener('click', ()=>{
            let temp = enlargedImage.src;
            enlargedImage.src = img.src
            img.src = temp
        })
    });
});