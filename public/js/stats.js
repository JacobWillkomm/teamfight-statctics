//Filter the initial tbodies
document.addEventListener("DOMContentLoaded", function(){
    let initSetFilter = document.getElementsByClassName("set-filter-selected")[0]
    UpdateTables(initSetFilter)
})

//Collabsible Champion Tiers
let rows = document.getElementsByTagName("tr")
for(let i = 0; i < rows.length; i++){
    let row = rows[i]
    row.addEventListener("click", function(){
        let head = this

        //If the row that we clicked is a subrow, find the previous non-subrow row
        while(head.classList.contains("subrow")){
            head = head.previousElementSibling
        }
        
        //grab the first subrow, each row is guaranteed to have at least 1 subrow
        let nextRow = head.nextElementSibling;

        //for each subrow, toggle the visibility
        while(nextRow && nextRow.classList.contains("subrow")){
            console.log(nextRow.style.visibility)
            if(nextRow.style.visibility === "visible"){
                nextRow.style.visibility = "collapse"
            }else{
                nextRow.style.visibility = "visible"
            }
            nextRow = nextRow.nextElementSibling;
        }
    })
}

//Unit Table:
let unitTable = document.getElementById("unit-table")
let unitHeaders = document.getElementsByClassName("unit-header")
let unitTbodies = document.getElementsByClassName("unit-tbody")

const unitDirections = Array.from(unitHeaders).map(function (header) {
    return '';
});

for(let i = 0; i < unitHeaders.length; i++){
    let unitHeader = unitHeaders[i];
    unitHeader.addEventListener("click", function(){
        sortColumn(i, "unit")
    })
}

const sortColumn = function(index, section){
    console.log(index)
    const newUnitTbodies = Array.from(unitTbodies)
    console.log(newUnitTbodies)
    let direction
    
    //Sort Unit Headers
    //TODO: Generalize sort for all tables
    if(section === "unit"){
        direction = unitDirections[index] || 'desc';
    }

    let multipler = (direction === "asc") ? 1 : -1

    newUnitTbodies.sort(function(aTBody,bTBody) {

        const cellA = aTBody.querySelectorAll('tr')[0].querySelectorAll('td')[index].innerHTML
        const cellB = bTBody.querySelectorAll('tr')[0].querySelectorAll('td')[index].innerHTML

        const a = transform(index, cellA)
        const b = transform(index, cellB)

        console.log("A: ", a, " B: ", b)

        switch(true){
            case a > b: return 1 * multipler
            case a < b: return -1 * multipler
            case a === b: return 0
        }
    })

    if(section === "unit"){
        unitDirections[index] = direction === "asc" ? "desc" : "asc"
    }

    Array.prototype.forEach.call(unitTbodies, function(unitTbody) {
        unitTable.removeChild(unitTbody)
    })

    newUnitTbodies.forEach(function(newTbody){
        unitTable.append(newTbody)
    })

}

// Transform the content of given cell in given column
const transform = function (index, content) {
    // Get the data type of column
    //TODO: generalize for multiple tables
    const type = unitHeaders[index].getAttribute('data-type');
    switch (type) {
        case 'number':
            return parseFloat(content);
        case 'string':
        default:
            return content;
    }
};

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

        //Update Tables
        UpdateTables(setFilters[i])

    })
}

//For each TBody in the document, collapse the TBody if not in filterSet
function UpdateTables(filterSet){
    let tbodies = document.querySelectorAll("tbody")
    for(let i = 0; i < tbodies.length; i++ ){
        let unitSet = tbodies[i].children[0].children[0].innerHTML

        if(unitSet.slice(0,1) !== filterSet.innerHTML.split(' ')[1] && unitSet !== "Set"){
            tbodies[i].style.visibility = "collapse"
        }else{
            tbodies[i].style.visibility = "visible"
        }
    }
}