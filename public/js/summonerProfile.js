let setFilters = document.querySelector(".set-filter").children

for(let i = 0; i < setFilters.length; i++){
    let set = setFilters[i];
    set.addEventListener("click", function(){
        //For each setFilter, remove "set-filter-selected" from classlist
        for(let i = 0; i < setFilters.length; i++){
            setFilters[i].classList.remove("set-filter-selected")
        }
        //Add "unit-filter-selected" to this one
        set.classList.add("set-filter-selected")

        //Update matches && pagnation
        

    })
}

let pages = document.querySelector(".pagination").children

for(let i = 0; i < pages.length; i++){
    let page = pages[i];
    page.addEventListener("click", function(){
        //For each page, remove "page-selected" from classlist
        for(let i = 0; i < pages.length; i++){
            pages[i].classList.remove("page-selected")
        }
        //Add "page-selected" to this one
        page.classList.add("page-selected")

        //Update matches
        updateMatchDisplay(page.innerHTML)

    })
}

function updateMatchDisplay(pageIndex){
    for(let matchIndex = 0; matchIndex < matches.length; matchIndex++){
        if(matchIndex >= ((+pageIndex - 1) * 10) && matchIndex < ((+pageIndex) * 10)){
            matches[matchIndex].style.display = "flex"
        }else{
            matches[matchIndex].style.display = "none"
        }
    }
}
let matches = document.querySelector(".match-list").children