const navMenu = document.getElementById("menu"),
navOpen = document.getElementById("openMenu"),
navClose = document.getElementById("closeMenu"),
navLink = document.querySelectorAll(".nav-link"),
navLogo = document.getElementById("logo"),
navSearchContainer = document.getElementById("nav-search-container"),
nav = document.getElementById("nav-bar"),
mainSearchForm = document.getElementById("main-search-form"),
navSearchForm = document.getElementById("nav-search-form"),
flexContainer = document.getElementById("flex-container"),
navSearchBar = document.getElementById("nav-search-bar"),
mainSearchBar = document.getElementById("main-search"),
loadMoreBtn = document.getElementById("load-more"),
errorTxt = document.getElementById("error-txt"),
searchResultParent = document.getElementById("search-result"),
networkStatusBar = document.getElementById("network-status")
BASE_URL = "https://api.pexels.com/v1/curated?page=1&per_page=18",
AUTH_HEADER = "563492ad6f9170000100000131a6e38d15924b8092e105e9419c116c",
closePopup = document.createElement("i")
closePopup.id = "close-popup"
closePopup.className = "bx bx-x"
let posY = 0, deviceWidth = window.innerWidth, pageCounter = 1, searchQuery = '', defaultPage = true

const sr = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 2000,
    reset: true
});

window.addEventListener("online", ()=>{
    networkStatusBar.className = "status-online"
    networkStatusBar.innerText = "Back online"
    errorTxt.className = "hide-nav-component"
    loadMoreBtn.className = "btn-load-more"
    setTimeout(()=>{
        networkStatusBar.style.display = "none"
    }, 1000)
})

window.addEventListener("offline", ()=>{
    networkStatusBar.className = "status-offline"
    networkStatusBar.innerText = "Network connection lost"
    networkStatusBar.style.display = "block"
    loadMoreBtn.className = "hide-nav-component"
    errorTxt.className = "error-txt"
    errorTxt.innerText = "Network connection lost!"
})

document.addEventListener("DOMContentLoaded", ()=>{
    fetchImages(BASE_URL).then(imagesData =>{
        loadImages(imagesData.photos);
    }).catch((error)=>{
        console.log(error)
    });
})

loadMoreBtn.addEventListener("click", ()=>{
    pageCounter +=1
    if(defaultPage){
        LOADMOREURL = `https://api.pexels.com/v1/curated?page=${pageCounter}&per_page=18`
        fetchImages(LOADMOREURL).then(imagesData =>{
            loadImages(imagesData.photos, loadMoreFlag = true);
    }).catch((error)=>{
        console.log(error)
    });

    } else {
        LOADMOREURL = `https://api.pexels.com/v1/search?query=${searchQuery}&page=${pageCounter}&per_page=18`
        fetchImages(LOADMOREURL).then(imagesData =>{
            loadImages(imagesData.photos, loadMoreFlag = true);
    }).catch((error)=>{
        console.log(error)      
    });
    }
})

async function fetchImages(URL){
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: AUTH_HEADER,
        }
    });
    return response.json();
}

navSearchForm.addEventListener("submit", (e)=>{
    const navFormData = new FormData(navSearchForm)
    searchQuery = navFormData.get("search");
    mainSearchBar.value = searchQuery;
    pageCounter = 1
    defaultPage = false
    SEARCH_URL = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=18`
    fetchImages(SEARCH_URL).then(imagesData =>{
        loadImages(imagesData.photos);
    });
    e.preventDefault();
    window.scrollTo(0,450)
})

mainSearchForm.addEventListener("submit", (e)=>{
    const mainFormData = new FormData(mainSearchForm)
    searchQuery = mainFormData.get("search");
    pageCounter = 1
    defaultPage = false
    SEARCH_URL = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=18`
    navSearchBar.value = searchQuery;
    fetchImages(SEARCH_URL).then(imagesData =>{
        loadImages(imagesData.photos);
    });
    e.preventDefault();
    window.scrollTo(0,150)
})

function imagePoper(){
    imagePopup = document.createElement("div")
    imagePopup.className = "image-popup"
    searchResultParent.prepend(imagePopup)
    document.body.className = "no-scroll"
    imagePopup.appendChild(closePopup)
    imageViewer = document.createElement("div")
    imageViewer.className = "image-viewer"
    displayImage = document.createElement("img")
    displayImage.src = this.getAttribute("data-download-img")
    displayImage.className = "display-img"
    downloadBtn = document.createElement("a")
    downloadBtn.href = `https://www.pexels.com/photo/${this.getAttribute("id")}/download/`
    downloadBtn.innerText = "Download"
    downloadBtn.className = "download-main"
    imageViewer.appendChild(displayImage)
    imagePopup.appendChild(imageViewer)
    imagePopup.appendChild(downloadBtn)
}

closePopup.addEventListener("click", ()=>{
    searchResultParent.removeChild(imagePopup)
    document.body.classList.remove("no-scroll")
})

function loadImages(photos, loadMoreFlag = false){
    if(photos.length == 0){
        loadMoreBtn.className = "hide-nav-component"
        errorTxt.className = "error-txt"
        errorTxt.innerText = `We couldn't find anything for "${searchQuery}"`
        while(flexContainer.firstChild){
            flexContainer.lastChild.remove()
        }

    } else {
        errorTxt.className = "hide-nav-component"
        loadMoreBtn.className = "btn-load-more"
        if(!loadMoreFlag){
            while(flexContainer.firstChild){
                flexContainer.lastChild.remove()
            }
        }

        photos.forEach(photo=>{
            const imageContainer = document.createElement("div"),
            wallImg = document.createElement("img"),
            imageFooter = document.createElement("div"),
            photographerName = document.createElement("div"),
            downloadLink = document.createElement("a"),
            downloadIcon = document.createElement("i")
            wallImg.src = photo.src.portrait
            photographerName.innerText = photo.photographer
            downloadLink.href = `https://www.pexels.com/photo/${photo.id}/download/`
            wallImg.alt = photo.alt
            wallImg.setAttribute("data-download-img", photo.src.large)
            wallImg.id = photo.id
            downloadIcon.classList.add("bx","bx-down-arrow-alt")
            wallImg.classList.add("wall-img")
            imageFooter.classList.add("image-footer")
            photographerName.classList.add("photo-txt")
            downloadLink.classList.add("download-btn")
            imageContainer.classList.add("image-container")
            imageContainer.appendChild(wallImg)
            downloadLink.appendChild(downloadIcon)
            imageContainer.appendChild(imageFooter)
            imageFooter.appendChild(photographerName)
            imageFooter.appendChild(downloadLink)
            flexContainer.appendChild(imageContainer)
        })

        let imageBinder = document.getElementsByClassName("wall-img")
        for(i=0; i<imageBinder.length; i++){
            imageBinder[i].addEventListener("click", imagePoper)
        }
    }
}

if(posY === 0){
    navSearchContainer.className ="hide-nav-component"
}

window.addEventListener("scroll", ()=>{
    posY = window.scrollY;
    if(posY>100){
        nav.className = "nav-background"
    }else{
        nav.className = "nav-transperent"
    }
    if(posY>=380){
        navSearchContainer.className ="nav-search-container"
        if(deviceWidth<768){
            navLogo.className ="hide-nav-component"
        }
    }else{
        navLogo.className = "logo"
        navSearchContainer.className ="hide-nav-component"
    }
});

if(navOpen){
    navOpen.addEventListener("click", ()=>{
        navMenu.classList.add("show-menu")
    })
}

if(navClose){
    navClose.addEventListener("click", ()=>{
        navMenu.classList.remove("show-menu")
    })
}

function linkAction(){
    const navMenu = document.getElementById("menu")
    navMenu.classList.remove("show-menu")
}

navLink.forEach(n => n.addEventListener('click',linkAction))

sr.reveal('.main-heading', {});
sr.reveal('.body-search-container', {});