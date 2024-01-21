
// Fetch the initial puzzle configuration 
async function Puzzlegame() {
    try {
        const response = await fetch('http://localhost:3000/tiles');
        const data = await response.json();

        const newElements = data.map((tile, index) => {
            let tileClass = "piece";  
            let position = tile.position || index + 1;
            return `<img src="images/${tile.url}" data-piece="${tile.piece}" data-position="${position}" class="${tileClass}">`;
        });

        const entirePuzzle = document.getElementById('puzzle');
        entirePuzzle.innerHTML = newElements.join('') + '<img src="images/blank.png" data-piece="0" data-position="9" class="piece blank">'; 

        addClickListenersToTiles();
    } catch (error) {
        console.error("Data has not been fetched", error);
    }
}

// Add click listeners to the tiles, but not the blank tile
function addClickListenersToTiles() {
    const pieces = document.querySelectorAll('.piece:not(.blank)');
    pieces.forEach(piece => {
        piece.removeEventListener('click', handleTileClick); 
        piece.addEventListener('click', handleTileClick);
    });
}

// Handle tile click event
function handleTileClick() {
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(p => p.classList.remove('selected'));
    this.classList.add('selected');
}

// Handle keyup event for moving tiles
function addKeyupListener() {
    window.addEventListener('keyup', function(e) {
        e.preventDefault(); 

        const selectedTile = document.querySelector('.piece.selected');
        if (!selectedTile) return;

        const blankTile = document.querySelector('.piece.blank');
        const sourcePosition = parseInt(selectedTile.getAttribute('data-position'));
        const blankPosition = parseInt(blankTile.getAttribute('data-position'));
        const grid = Math.sqrt(document.querySelectorAll('.piece').length);

        // Calculate the row and column for the source and blank tiles
        const sourceRow = Math.ceil(sourcePosition / grid);
        const sourceCol = sourcePosition % grid || grid;
        const blankRow = Math.ceil(blankPosition / grid);
        const blankCol = blankPosition % grid || grid;
       
        let swapNeeded = false;
        switch (e.key) {
            case 'ArrowDown':
                swapNeeded = sourceCol === blankCol && sourceRow + 1 === blankRow;
                break;
            case 'ArrowUp':
                swapNeeded = sourceCol === blankCol && sourceRow - 1 === blankRow;
                break;
            case 'ArrowLeft':
                swapNeeded = sourceRow === blankRow && sourceCol - 1 === blankCol;
                break;
            case 'ArrowRight':
                swapNeeded = sourceRow === blankRow && sourceCol + 1 === blankCol;
                break;
        }
       
        if (swapNeeded) {
            swap(selectedTile, blankTile);
        }
    });
}

// Swap two tiles in the puzzle
function swap(source, destination) {

    // Swap the 'data-position' attributes
    let sourcePosition = source.getAttribute('data-position');
    let destinationPosition = destination.getAttribute('data-position');
    source.setAttribute('data-position', destinationPosition);
    destination.setAttribute('data-position', sourcePosition);

    // Physically swap the tiles in the DOM
    let sourceClone = source.cloneNode(true);
    let destinationClone = destination.cloneNode(true);
    destination.parentNode.replaceChild(sourceClone, destination);
    source.parentNode.replaceChild(destinationClone, source);
    
    // Update selected state and listeners
    sourceClone.classList.remove('selected');
    addClickListenersToTiles();  
    
    // Update the game status
    updateGameStatus();
    
}

// Updating the game after each move
function updateGameStatus() {
    const tiles = document.querySelectorAll('.piece');
    let correctPositions = 0;
    tiles.forEach(tile => {
        if (tile.getAttribute('data-piece') === tile.getAttribute('data-position')) {
            correctPositions++;
        }
    });

    const infoPosition = document.getElementById('info');
    infoPosition.textContent = `${correctPositions} Tiles are in correct position`;

    if (correctPositions === tiles.length - 1) {
        infoPosition.textContent += "Congratulations, You have won the game!";
    }
}

// check if the puzzle is solvable
function checkIfPuzzleIsSolvable() {
    const pieces = document.querySelectorAll('.piece');
    if (isPuzzleSolvable(Array.from(pieces))) {
        alert('This puzzle configuration is solvable.', pieces);
    } else {
        alert('This puzzle configuration is not solvable.', pieces);
    }
}
function countInversions(array) {
    let inversions = 0;
    for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] > array[j]) {
                inversions++;
            }
        }
    }
    return inversions;
}

function isPuzzleSolvable(tiles) {
    
    let tileNumbers = Array.from(tiles).map(tile => parseInt(tile.getAttribute('data-piece')));
    let inversions = countInversions(tileNumbers);
    return inversions % 2 === 0;
}

document.addEventListener('DOMContentLoaded', () => {
    Puzzlegame();
    addKeyupListener();
    document.getElementById('check').addEventListener('click', checkIfPuzzleIsSolvable);
});
