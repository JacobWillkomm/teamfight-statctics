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