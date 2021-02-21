import { regularBoardSpaces } from './constants.js' 

//DOM elements
var hexes = []
var resourceHexes = []
var portHexes = []
var blankHexes = []

var ports = Array.from(document.getElementsByClassName("port"));
var dots =  Array.from(document.getElementsByClassName("token"));
var fishTokens =  Array.from(document.getElementsByClassName("fishtoken"));

var generateButton = document.getElementById("generateButton")

var board = []

dots.forEach(dot => {
    dot.style.display = "none";
});

fishTokens.forEach((fishToken) => {
    fishToken.style.display = "none";
});

document.getElementById('generateButton').onclick = () => {
    generateButton.disabled = "true"
    generateButton.innerText = "Generating..."
    generateNewBoard();
}

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
        blankHex.style.opacity = 0;
    })
}

createLayout();

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

    const probabilities = {
        "2": ".",
        "3": "..",
        "4": "...",
        "5": "....",
        "6": ".....",
        "8": ".....",
        "9": "....",
        "10": "...",
        "11": "..",
        "12": ".",
    }

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
        console.log([hexes, regularBoardSpaces, index, regularBoardSpaces.ports[index]])
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

            fishTokens[index].style.top = `${fishingShoals[index].offsetTop + 40}px`
            fishTokens[index].style.left = `${fishingShoals[index].offsetLeft + 70}px`
            fishTokens[index].style.zIndex = 5;
            fishTokens[index].style.color = "lightblue";
            fishTokens[index].innerHTML = `${fishNumbers[index]}<br>${probabilities[fishNumbers[index]]}`

            fishTokens[index].style.display = ""
        });

        hexes.forEach((hex) => {
            if (hex.src.toString().includes("images/desert.png")) {
                hex.src = "images/lake.jpg"
            }
        })
    } else {
        fishTokens.forEach((fishToken) => fishToken.style.display = "none")
        hexes.forEach((hex) => {
            if (hex.src.toString().includes("images/lake.jpg")) {
                hex.src = "images/desert.jpg"
            }
        })
    }

    //CHECK FOR BOARD DEFECTS
    console.log("Check board for defects");

    let boardDefect = false;

    const spotAdjacencyTable = [[1, 3, 4], [0, 2, 4, 5], [1, 5, 6], [0, 4, 7, 8], [0, 1, 3, 5, 8, 9], [1, 4, 6, 9, 10], [2, 5, 10, 11], [3, 8, 12], [3, 4, 7, 9, 12, 13], [4, 5, 8, 10, 13, 14], [5, 6, 9, 11, 14, 15], [6, 10, 15], [7, 8, 13, 16], [8, 9, 12, 14, 16, 17], [9, 10, 13, 15, 17, 18], [10, 11, 14, 18], [12, 13, 17], [13, 14, 16, 18], [14, 15, 17]]
    const portAdjacencyTable = [[0, 1], [2], [0, 3], [6, 11], [7], [11, 15], [12, 16], [16, 17], [18]]

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
                spotAdjacencyTable[index].forEach((adjacentSpot) => {
                    if (isRedSpace(board[adjacentSpot].count)) {
                        boardDefect = true;
                    }
                });
            }
        })

    }
    if (noResourceClusters) {
        board.forEach(({ resource }, index) => {
            const neighboringResources = spotAdjacencyTable[index].map((x) => board[x].resource).filter((y) => y === resource);
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


const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const pickRandomly = (x, y) => Math.random() > .5 ? x : y;

const isRedSpace = (count) => count === 6 || count === 8;

generateNewBoard()