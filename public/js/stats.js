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

let unitTable = document.getElementById("unit-table")
let unitHeaders = document.getElementsByClassName("unit-header")
let unitTbodies = document.getElementsByClassName("unit-tbody")

console.log(unitTable.length)
console.log(unitHeaders)
console.log(unitTbodies.length)

for(let i = 0; i < unitHeaders.length; i++){
    let unitHeader = unitHeaders[i];
    unitHeader.addEventListener("click", function(){
        sortColumn(i)
    })
}

const sortColumn = function(index){
    console.log(index)
    const newUnitTbodies = Array.from(unitTbodies)
    console.log(newUnitTbodies)
    newUnitTbodies.sort(function(aTBody,bTBody) {

        const cellA = aTBody.querySelectorAll('tr')[0].querySelectorAll('td')[index].innerHTML
        const cellB = bTBody.querySelectorAll('tr')[0].querySelectorAll('td')[index].innerHTML

        console.log("A: ", cellA, " B: ", cellB)

        switch(true){
            case cellA > cellB:
                return 1
            case cellA < cellB:
                return -1
            case cellA === cellB:
                return 0
        }
    })

    Array.prototype.forEach.call(unitTbodies, function(unitTbody) {
        unitTable.removeChild(unitTbody)
    })

    newUnitTbodies.forEach(function(newTbody){
        unitTable.append(newTbody)
    })

}