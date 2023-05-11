let setFilters = document.querySelector(".set-filter").children

for(let i = 0; i < setFilters.length; i++){
    let set = setFilters[i];
    set.addEventListener("click", function(){
        let index = i
        //For each setFilter, remove "set-filter-selected" from classlist
        for(let i = 0; i < setFilters.length; i++){
            setFilters[i].classList.remove("set-filter-selected")
        }
        //Add "unit-filter-selected" to this one
        set.classList.add("set-filter-selected")

        //Update matches && pagnation
        updateMatchDisplaySet(index)

        //Update HeaderStats
        updateHeaderStatsDisplay(index)

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

        //Update matches page
        updateMatchDisplayPage(page.innerHTML)
    })
}

function updateMatchDisplaySet(setIndex){
    let tempMatches = matches
    if(setIndex < setFilters.length - 1){
        tempMatches = matches.filter(match => match.dataset.set === ("" + (8 - setIndex)))
    }
    console.log(tempMatches)
    //Hide all matches
    for(let matchIndex = 0; matchIndex < matches.length; matchIndex++){
        matches[matchIndex].style.display = "none"
    }
    //Show the first 10 of the selected set's matches
    for(let matchIndex = 0; matchIndex < Math.min(tempMatches.length, 10); matchIndex++){
        tempMatches[matchIndex].style.display = "flex"
    }
    //Update pagination
    for(let i = 0; i < pages.length; i++){
        pages[i].classList.remove("page-selected")
        if(i > (Math.ceil(tempMatches.length / 10) - 1)){
            pages[i].style.display = "none"
        }else{
            pages[i].style.display = "flex"
        }

    }
    pages[0].classList.add("page-selected")
}

function updateMatchDisplayPage(pageIndex){
    //get filtered matches
    let tempMatches = matches
    let setSelected = document.querySelector(".set-filter-selected")
    var childArray = [...setSelected.parentElement.children]
    //Filter the matches based on set-filter-selected index
    childArray.forEach((ele, i) => {
        if(setSelected === ele && i < (childArray.length - 1)){
            tempMatches = matches.filter(match => match.dataset.set === ("" + (8 - i)))
        }
    })
    //Update displayed matches
    for(let matchIndex = 0; matchIndex < tempMatches.length; matchIndex++){
        if(matchIndex >= ((+pageIndex - 1) * 10) && matchIndex < ((+pageIndex) * 10)){
            tempMatches[matchIndex].style.display = "flex"
        }else{
            tempMatches[matchIndex].style.display = "none"
        }
    }
}
let matches = Array.from(document.querySelector(".match-list").children)

function updateHeaderStatsDisplay(setIndex){
    for(let headerStatIndex = 0; headerStatIndex < headerStatList.length; headerStatIndex++){
        if(headerStatIndex === setIndex){
            headerStatList[headerStatIndex].style.display = "flex"
        }else{
            headerStatList[headerStatIndex].style.display = "none"
        }
    }
}

let headerStatList = document.querySelector(".profile-stats").children
console.log(headerStatList)