//DOM elements
var spots = Array.from(document.getElementsByClassName("spot"));
var ports = Array.from(document.getElementsByClassName("port"));
var dots =  Array.from(document.getElementsByClassName("token"));
var fishTokens =  Array.from(document.getElementsByClassName("fishtoken"));

var generateButton = document.getElementById("generateButton")


var attempt = 0;

dots.forEach(dot => {
    dot.style.display = "none";
});

fishTokens.forEach((fishToken) => {
    fishToken.style.display = "none";
});


const generateButtonClicked = () => {
    generateButton.disabled = "true"
    generateButton.innerText = "Generating..."
    generateNewBoard();
}

const generateNewBoard = () => {
    Array.from(document.getElementsByClassName("port")).forEach((portElement) => {
        if (portElement.src.toString().includes("images/fish.jpg")) {
            portElement.classList.replace("port", "hide")
        }
    })
    

    attempt++;
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

    if (greatCaravanEnabled) { //Swap desert with center square
        const desertIndex = resourceOptions.findIndex(x => x == "desert");
        const temp = resourceOptions[9];
    
        resourceOptions[9] = "desert";
        resourceOptions[desertIndex] = temp;
    }

    resourceOptions.forEach((resource, index) => {
        if (resource === "desert" && greatCaravanEnabled) {
            spots[index].src = pickRandomly("images/caravan1.jpg", "images/caravan2.jpg")
        } else {
            spots[index].src = `images/${resource}.png`
        }
    });

    //SHUFFLE AND SET DOTS
    console.log("Shuffle and set dots");

    let counts = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]
    shuffleArray(counts);

    counts.splice(resourceOptions.findIndex(x => x === "desert"), 0, -1) //we need to add a count in for the desert

    resourceOptions.forEach((resource, index) => {
        if (resource !== "desert") {
            dots[index].style.top = `${spots[index].offsetTop + 40}px`
            dots[index].style.left = `${spots[index].offsetLeft + 70}px`

            dots[index].style.zIndex = 5;

            dots[index].innerHTML = `${counts[index]}<br>${probabilities[counts[index]]}`

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

    const totalResourceCounts = {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        rock: 0
    }

    resourceOptions.forEach((resourceOption, index) => {
        if (resourceOption !== "desert") {
            totalResourceCounts[resourceOption] += probabilities[counts[index].toString()].length;
        }
    })

    let totalCount = 0;

    counts.forEach((count) => {
        if (count > 0) {
            totalCount = totalCount + probabilities[count.toString()].length
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
        ports[index].src = `images/${portType}.png`
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

        spots.forEach((spot) => {
            if (spot.src.toString().includes("images/desert.png")) {
                spot.src = "images/lake.jpg"
            }
        })
    } else {
        fishTokens.forEach((fishToken) => fishToken.style.display = "none")
        spots.forEach((spot) => {
            if (spot.src.toString().includes("images/lake.jpg")) {
                spot.src = "images/desert.jpg"
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

        counts.forEach((count, index) => {
            if (isRedSpace(count)) {
                redSpaceResourceTypes[resourceOptions[index]] = redSpaceResourceTypes[resourceOptions[index]] + 1;
            }
        })

        Object.values(redSpaceResourceTypes).forEach((redSpaceCount) => {
            if (redSpaceCount > 1) {
                boardDefect = true;
            }
        })

    }
    if (noNeighboringRedSpaces) {
        counts.forEach((count, index) => {
            if (isRedSpace(count)) {
                spotAdjacencyTable[index].forEach((adjacentSpot) => {
                    if (isRedSpace(counts[adjacentSpot])) {
                        boardDefect = true;
                    }
                });
            }
        })

    }
    if (noResourceClusters) {
        resourceOptions.forEach((resource, index) => {
            const neighboringResources = spotAdjacencyTable[index].map((x) => resourceOptions[x]).filter((y) => y === resource);
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
        const desertIndex = resourceOptions.findIndex(x => x === "desert");

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