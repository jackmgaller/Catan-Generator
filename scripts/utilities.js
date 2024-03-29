export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const pickRandomlyFromPair = (x, y) => Math.random() > .5 ? x : y;

export const pickRandomElement = (items) => items[Math.floor(Math.random() * items.length)];

export  const isRedSpace = (count) => count === 6 || count === 8;