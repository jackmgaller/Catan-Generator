import { probabilities, regularBoardSpaces, portAdjacencyTable, hexAdjacencyTable } from './constants.js' 
import { isRedSpace, pickRandomly, shuffleArray } from './utilities.js'

//DOM elements
var hexes = []
var resourceHexes = []
var portHexes = []
var blankHexes = []

var dots = [] 
var fishDots = []

var board = []

var generateButton = document.getElementById("generateButton")

//Event handler
document.getElementById('generateButton').onclick = () => {
    generateButton.disabled = "true"
    generateButton.innerText = "Generating..."
    generateNewBoard();
}

//Functions
const createLayout = () => {
    const boardElement = document.getElementById('board');

    [0, 1, 2, 3, 2, 1, 0].forEach((rowNumber) => {
        const rowElement = document.createElement('div');
        rowElement.classList.add("row");
        rowElement.classList.add(`row${rowNumber}`);

        for (let i = 0; i < rowNumber + 4; i++) {
            const hexElement = document.createElement('img');
            hexElement.classList.add('hex');

            rowElement.appendChild(hexElement);
        }

        boardElement.appendChild(rowElement);
    })

    hexes = Array.from(document.getElementsByClassName("hex"));

    resourceHexes = Array.from(hexes).filter((_, index) => regularBoardSpaces.resources.includes(index))
    portHexes = Array.from(hexes).filter((_, index) => regularBoardSpaces.ports.includes(index))
    blankHexes = Array.from(hexes).filter((_, index) => regularBoardSpaces.hidden.includes(index))

    blankHexes.forEach((blankHex) => {
        blankHex.classList.add("hide");
    });

    const dotContainerElement = document.createElement('div');

    for (let i = 0; i < 19; i++) {
        const dotElement = document.createElement('div');

        dotElement.classList.add("token");
        dotElement.innerHTML = "NUMBER<br>DOTS";

        dotContainerElement.appendChild(dotElement)
    }

    for (let i = 0; i < 6; i++) {
        const fishDotElement = document.createElement('div');

        fishDotElement.classList.add("fishtoken");
        fishDotElement.innerHTML = "NUMBER<br>DOTS";
        fishDotElement.style.display = "none";

        dotContainerElement.appendChild(fishDotElement)
    }

    boardElement.appendChild(dotContainerElement)

    dots = Array.from(document.getElementsByClassName("token"));
    fishDots = Array.from(document.getElementsByClassName("fishtoken"));
}

const generateNewBoard = () => {
    Array.from(document.getElementsByClassName("port")).forEach((portElement) => {
        if (portElement.src.toString().includes("images/fish.jpg")) {
            portElement.classList.replace("port", "hide")
        }
    })
    

    //settings
    let noRedSpacesOfSameResource = document.getElementById("noRedSpacesOfSameResource").checked;
    let noNeighboringRedSpaces = document.getElementById("noNeighboringRedSpaces").checked;
    let noResourceClusters = document.getElementById("noResourceClusters").checked;
    let noRedPorts = document.getElementById("noRedPorts").checked;
    let fishermenOfCatanEnabled = document.getElementById("fishermenOfCatanEnabled").checked;
    let greatCaravanEnabled = document.getElementById("greatCaravanEnabled").checked;

    

    //SHUFFLE AND SET RESOURCES
    console.log("Shuffle and set resources");

    let resourceOptions = ["sheep", "sheep", "sheep", "sheep", "wood", "wood", "wood", "wood", "wheat", "wheat", "wheat", "wheat", "brick", "brick", "brick", "rock", "rock", "rock", "desert"]
    shuffleArray(resourceOptions)

    board = resourceOptions.map(r => {
        return {
            "resource": r
        }
    });

    if (greatCaravanEnabled) { //Swap desert with center square
        const desertIndex = board.findIndex(x => x.resource === "desert");
        const temp = board[9];
    
        board[9] = {
            "resource": "desert"
        };
        board[desertIndex] = temp;
    }

    
    board.forEach((tile, index) => {
        if (tile.resource === "desert" && greatCaravanEnabled) {
            resourceHexes[index].src = pickRandomly("images/caravan1.jpg", "images/caravan2.jpg")
        } else {
            resourceHexes[index].src = `images/${tile.resource}.png`
        }
    });

    //SHUFFLE AND SET DOTS
    console.log("Shuffle and set dots");

    let counts = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]
    shuffleArray(counts);

    counts.splice(board.findIndex(x => x.resource === "desert"), 0, -1) //we need to add a count in for the desert

    board = board.map((tile, index) => {
        return {
            ...tile,
            count: counts[index]
        }
    });

    console.log(board)

    board.forEach(({resource, count}, index) => {
        if (resource !== "desert") {
            dots[index].style.top = `${resourceHexes[index].offsetTop + 40}px`
            dots[index].style.left = `${resourceHexes[index].offsetLeft + 70}px`

            dots[index].style.zIndex = 5;

            dots[index].innerHTML = `${count}<br>${probabilities[count]}`

            if (counts[index] === 6 || counts[index] === 8) {
                dots[index].style.color = "red";
            } else {
                dots[index].style.color = "black";
            }

            dots[index].style.display = ""
        } else {
            dots[index].style.display = "none"
        }
    })

    //GET DISTRIBUTION OF RESOURCES
    console.log("Get and view distribution of resources");

    let totalCount = 0;

    const totalResourceCounts = {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        rock: 0
    }

    board.forEach(({ resource, count }, index) => {
        if (resource !== "desert") {
            const dotCount = probabilities[count.toString()].length;

            totalResourceCounts[resource] = totalResourceCounts[resource] + dotCount;
            totalCount = totalCount + dotCount;
        }
    })

    Object.entries(totalResourceCounts).forEach(([resource, count]) => {
        document.getElementById(`${resource}Percent`).innerText = `${resource[0].toUpperCase()}${resource.substring(1)}: ${(count/totalCount*100).toFixed(2)}%`
    });


    //SHUFFLE AND SET PORTS
    console.log("Shuffle and set ports");

    const portTypes = ["any port", "any port", "any port", "any port", "sheep port", "brick port", "wood port", "wheat port", "rock port"]
    shuffleArray(portTypes)

    portTypes.forEach((portType, index) => {
        portHexes[index].src = `images/${portType}.png`
    });

    //CHECK SUBGAMES

    //FISHERMEN OF CATAN

    let fishingShoals = [];
    
    if (fishermenOfCatanEnabled) {
        console.log("Fishermen of Catan");

        const fishNumbers = ["4", "5", "6", "8", "9", "10"]
        shuffleArray(fishNumbers)

        const hiddenPorts = Array.from(document.getElementsByClassName("hide"));
        fishingShoals = [hiddenPorts[1], hiddenPorts[2], hiddenPorts[3], hiddenPorts[5], hiddenPorts[6], hiddenPorts[8]]
        fishingShoals.forEach((shoal, index) => {
            shoal.classList.replace("hide", "port");
            shoal.src = "images/fish.jpg"

            fishDots[index].style.top = `${fishingShoals[index].offsetTop + 40}px`
            fishDots[index].style.left = `${fishingShoals[index].offsetLeft + 70}px`
            fishDots[index].style.zIndex = 5;
            fishDots[index].style.color = "lightblue";
            fishDots[index].innerHTML = `${fishNumbers[index]}<br>${probabilities[fishNumbers[index]]}`

            fishDots[index].style.display = ""
        });

        hexes.forEach((hex) => {
            if (hex.src.toString().includes("images/desert.png")) {
                hex.src = "images/lake.jpg"
            }
        })
    } else {
        fishDots.forEach((fishDot) => fishDot.style.display = "none")
        hexes.forEach((hex) => {
            if (hex.src.toString().includes("images/lake.jpg")) {
                hex.src = "images/desert.jpg"
            }
        })
    }

    //CHECK FOR BOARD DEFECTS
    console.log("Check board for defects");

    let boardDefect = false;

    

    if (noRedSpacesOfSameResource) {
        let redSpaceResourceTypes = {
            "brick": 0,
            "rock": 0,
            "sheep": 0,
            "wheat": 0,
            "wood": 0,
        }

        board.forEach(({ resource, count }) => {
            if (isRedSpace(count)) {
                redSpaceResourceTypes[resource] = redSpaceResourceTypes[resource] + 1;
            }
        })

        if (Object.values(redSpaceResourceTypes).some(x => x > 1)) boardDefect = true;

    }
    if (noNeighboringRedSpaces) {
        board.forEach(({ count }, index) => {
            if (isRedSpace(count)) {
                hexAdjacencyTable[index].forEach((adjacentSpot) => {
                    if (isRedSpace(board[adjacentSpot].count)) {
                        boardDefect = true;
                    }
                });
            }
        })

    }
    if (noResourceClusters) {
        board.forEach(({ resource }, index) => {
            const neighboringResources = hexAdjacencyTable[index].map((x) => board[x].resource).filter((y) => y === resource);
            const matchingNeighborsCount = neighboringResources.length;
            
            if (resource === "wood" || resource === "sheep" || resource === "wheat") {
                if (matchingNeighborsCount === 3) {
                    boardDefect = true;
                } 
            } else if (resource === "rock" || resource === "brick") {
                if (matchingNeighborsCount === 2) {
                    boardDefect = true;
                } 
            }
        });
    }
    if (noRedPorts) {
        portAdjacencyTable.forEach((portAdjacencies, index) => {
            const portType = portTypes[index].split(" ")[0];

            if (portType !== "any") {
                portAdjacencies.forEach((portAdjacency) => {
                    if (portType === resourceOptions[portAdjacency] && isRedSpace(counts[portAdjacency])) boardDefect = true;
                });
            }
        });
    }
    if (fishermenOfCatanEnabled) {
        const desertIndex = board.findIndex(x => x.resource === "desert");

        if (!(desertIndex === 4 || desertIndex === 5 || desertIndex === 8 || desertIndex === 9 || desertIndex === 10 || desertIndex === 13 || desertIndex === 14)) {
            boardDefect = true;
        }



    }

    if (boardDefect) {
        requestAnimationFrame(generateNewBoard)
    } else {
        generateButton.innerText = "Generate!"
        generateButton.disabled = ""
    }

}

createLayout()
generateNewBoard()