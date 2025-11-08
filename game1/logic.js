document.oncontextmenu = () => {
    return false;
}

document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("puzzle-board");
    const progressBar = document.getElementById("progress-bar");
    const countdownValue = document.getElementById("countdown-value");
    const scoreValue = document.getElementById("score-value");
    const icScoreValue = document.getElementById("ic-score-value");
    const levelValue = document.getElementById("level-value");

    const shuffleButton = document.getElementById("shuffle-button");
    const addTimeButton = document.getElementById("add-time-button");
    const endGameButton = document.getElementById("end-game-button");
    const remText = document.getElementById("rem");

    const gridSize = 4;
    const oldtiles = [...Array(gridSize * gridSize - 1).keys()].map(i => i + 1);
    // const tiles = [1, 4, 5, 2, 3, 6, 8, 7, 10, 9, 11, 12, 13, 15, 14];

    // tiles.push(null); // Represent the empty space

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array
    }

    function getRandomFixedTiles(min = 1, max = 8) {
        const allTiles = [...oldtiles];

        // random number of tiles between min and max
        const count = Math.floor(Math.random() * (max - min + 1)) + min;

        // shuffle array (Fisher–Yates)
        for (let i = allTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
        }

        // pick first `count` tiles and sort ascending
        const fixedTiles = allTiles.slice(0, count).sort((a, b) => a - b);

        return fixedTiles;
    }

    function countCorrectFixedTiles(current, solved, fixedTiles) {
        // Precompute position maps for efficiency
        const currentPos = {};
        const solvedPos = {};

        current.forEach((tile, i) => (currentPos[tile] = i));
        solved.forEach((tile, i) => (solvedPos[tile] = i));

        // Count how many fixed tiles are correct
        let correctCount = 0;

        for (const tile of fixedTiles) {
            if (currentPos[tile] === solvedPos[tile]) {
                correctCount++;
            }
        }

        return correctCount;
    }

    function getCorrectFixedTiles(current, solved, fixedTiles) {
        const currentPos = {};
        const solvedPos = {};
        current.forEach((tile, i) => (currentPos[tile] = i));
        solved.forEach((tile, i) => (solvedPos[tile] = i));

        return fixedTiles.filter(tile => currentPos[tile] === solvedPos[tile]);
    }

    // Returns an array of non-fixed tiles that are currently NOT in their correct position
    function getIncorrectTiles(current, solved, fixedTiles) {
        const currentPos = Object.fromEntries(current.map((t, i) => [t, i]));
        const solvedPos = Object.fromEntries(solved.map((t, i) => [t, i]));
        const fixedSet = new Set(fixedTiles);

        // iterate over solved (1..8 and 0) to keep canonical order
        return solved.filter(tile =>
            tile !== null &&                  // skip empty
            !fixedSet.has(tile) &&         // skip fixed tiles
            currentPos[tile] !== solvedPos[tile] // tile is NOT in correct spot
        );
    }

    // Returns the count of such tiles
    function countIncorrectTiles(current, solved, fixedTiles) {
        return getIncorrectTiles(current, solved, fixedTiles).length;
    }


    // change correct order to something random
    // const tiles = shuffleArray([...oldtiles]);

    // Use original correct order
    const tiles = [...oldtiles];

    tiles.push(null); // Represent the empty space

    fixed = getRandomFixedTiles(1, 8);
    console.log(fixed);

    console.log("correct order: ", tiles);
    let shuffledTiles;
    let moves = 52; // Initial time limit in seconds
    let timerInterval;
    let score = 0;
    let progress = 100;
    let chancesRemaining = 5; // Number of chances for using the "Add 5 Seconds" power-up

    // Helper function to shuffle the tiles with no tiles in their right position
    function shuffleTilesNoRightPosition(array) {
        const shuffledArray = [...array];
        do {
            for (let i = shuffledArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
            }
        } while (isAnyInRightPosition(shuffledArray));
        return shuffledArray;
    }

    // Function to check if any tile is in its right position
    function isAnyInRightPosition(array) {
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i] === i + 1) {
                return true;
            }
        }
        return false;
    }

    // Initialize the puzzle board with tiles not in their right positions
    shuffledTiles = shuffleTilesNoRightPosition([...tiles]);

    // Function to render the puzzle board
    function renderBoard() {
        board.innerHTML = "";
        shuffledTiles.forEach((tile) => {
            const tileElement = document.createElement("div");
            tileElement.classList.add("tile");
            tileElement.textContent = tile === null ? "" : tile.toString();
            if (tile === null) {
                tileElement.style.backgroundColor = '#000';
            }

            if (fixed.includes(tile)) {
                tileElement.style.backgroundColor = 'red';
            }

            if (getCorrectFixedTiles(shuffledTiles, tiles, fixed).includes(tile)) {
                tileElement.style.backgroundColor = 'green';
            }

            if (!fixed.includes(tile) && tile !== null && !getIncorrectTiles(shuffledTiles, tiles, fixed).includes(tile)) {
                tileElement.style.color = 'red';
            }

            console.log("IC: ", getIncorrectTiles(shuffledTiles, tiles, fixed))

            tileElement.addEventListener("click", () => handleTileClick(tile));
            board.appendChild(tileElement);

            no_correct_fixed = countCorrectFixedTiles(shuffledTiles, tiles, fixed)
            correct_fixed = getCorrectFixedTiles(shuffledTiles, tiles, fixed)
            no_incorrect_fixed = countIncorrectTiles(shuffledTiles, tiles, fixed)
            incorrect_fixed = getIncorrectTiles(shuffledTiles, tiles, fixed)
            scoreValue.textContent = `${no_correct_fixed}/${fixed.length}`;
            icScoreValue.textContent = `${no_incorrect_fixed}/${15 - fixed.length}`;
        });
    }

    // Function to handle tile click events
    function handleTileClick(tile) {
        const tileIndex = shuffledTiles.indexOf(tile);
        const emptyIndex = shuffledTiles.indexOf(null);
        if (isAdjacent(tileIndex, emptyIndex)) {
            shuffledTiles[tileIndex] = null;
            shuffledTiles[emptyIndex] = tile;
            renderBoard();
            handleMove();
            console.log(shuffledTiles)
            no_correct_fixed = countCorrectFixedTiles(shuffledTiles, tiles, fixed)
            correct_fixed = getCorrectFixedTiles(shuffledTiles, tiles, fixed)
            console.log(no_correct_fixed);
            console.log(correct_fixed);
            if (checkWin(shuffledTiles, tiles, fixed)) {
                endGame();
            }

            // Calculate the new win percentage based on tiles in their correct positions
            // const correctOrderCount = tiles.reduce((count, tile, index) => {
            //     return count + (tile === shuffledTiles[index] && tile !== null ? 1 : 0);
            // }, 0);
            scoreValue.textContent = `${no_correct_fixed}/${fixed.length}`;
        }
    }

    // Function to handle the "Shuffle" power-up button click
    function useShufflePowerUp() {
        // Add your shuffle logic here...
        // For example, you can shuffle the tiles and render the board
        shuffledTiles = shuffleTilesNoRightPosition([...tiles]);
        no_correct_fixed = countCorrectFixedTiles(shuffledTiles, tiles, fixed)
        correct_fixed = getCorrectFixedTiles(shuffledTiles, tiles, fixed)
        scoreValue.textContent = `${no_correct_fixed}/${fixed.length}`;
        renderBoard();
    }

    // Function to handle the "Add 5 Seconds" power-up button click
    function useAddTimePowerUp() {
        if (chancesRemaining > 0) {
            // Calculate the remaining time to be added
            progress = Math.min(progress + (100 / moves) * 20, 100);

            // Update the progress bar and countdown
            progressBar.style.width = progress + "%";
            countdownValue.textContent = Math.ceil(progress / (100 / moves));

            // Decrement chances remaining
            chancesRemaining--;

            // Update the chances display
            updateChancesDisplay();
        }
    }

    function endGame() {
        // open(`/result/${score}/`, '_parent');
        open(`result.html`, '_parent');
    }

    // Update the display of remaining chances
    function updateChancesDisplay() {
        // addTimeButton.textContent = `Add 5 Seconds (${chancesRemaining} left)`;
        remText.textContent = `${chancesRemaining}`;
    }

    // Add event listeners for power-up buttons
    shuffleButton.addEventListener("click", useShufflePowerUp);
    addTimeButton.addEventListener("click", useAddTimePowerUp);
    endGameButton.addEventListener("click", endGame);

    // Helper function to check if two tiles are adjacent
    function isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / gridSize);
        const col1 = index1 % gridSize;
        const row2 = Math.floor(index2 / gridSize);
        const col2 = index2 % gridSize;
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    // Function to check if the user has won
    // function checkWin() {
    //     for (let i = 0; i < tiles.length - 1; i++) {
    //         if (shuffledTiles[i] !== i + 1) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    function checkWin(current, solved, fixedTiles) {
        // Create a quick lookup for current positions
        const currentPos = {};
        current.forEach((tile, index) => {
            currentPos[tile] = index;
        });

        let fixedCorrect = true;
        let remainingIncorrect = true;

        for (const tile of solved) {
            if (tile === null) continue; // skip empty space

            const currentIndex = currentPos[tile];
            const correctIndex = solved.indexOf(tile);
            const isFixed = fixedTiles.includes(tile);

            if (isFixed) {
                // All fixed tiles must be in correct spot
                if (currentIndex !== correctIndex) {
                    fixedCorrect = false;
                    break;
                }
            } else {
                // All other tiles must NOT be in correct spot
                if (currentIndex === correctIndex) {
                    remainingIncorrect = false;
                    break;
                }
            }
        }

        return fixedCorrect && remainingIncorrect;
    }


    // Function to handle the timer
    function startTimer() {
        progress = 100;
        timerInterval = setInterval(() => {
            progress -= 100 / moves;
            // console.log(progress)
            progressBar.style.width = progress + "%";
            countdownValue.textContent = Math.ceil(progress / (100 / moves));
            if (progress <= 0) {
                clearInterval(timerInterval);
                // alert("Time's up! Game over.");
                open(`/result/${score}/`, '_parent');
                // resetGame();
            }
        }, 1000);
    }

    // Function to handle the moves
    function handleMove() {
        // progress = 100;
        progress -= 100 / moves;
        // console.log(progress)
        progressBar.style.width = progress + "%";
        countdownValue.textContent = Math.ceil(progress / (100 / moves));
        if (progress <= 0) {
            // clearInterval(timerInterval);
            // alert("Time's up! Game over.");
            open(`/result/${score}/`, '_parent');
            // resetGame();
        }
    }


    // Function to reset the game
    function resetGame() {
        clearInterval(timerInterval);
        // Reset shuffledTiles, progress bar, and render the board
        shuffledTiles = shuffleTilesNoRightPosition([...tiles]);
        renderBoard();
        progressBar.style.width = "100%";
        countdownValue.textContent = moves;
        // Reset chances for using "Add 5 Seconds" power-up
        chancesRemaining = 2;
        updateChancesDisplay();
        // Adjust time limit based on the score
        if (score > 10 && score < 25) {
            moves = 30;
        } else if (score >= 25) {
            moves = 25;
        } else {
            moves = 40;
        }
        countdownValue.textContent = moves;
        levelValue.textContent = moves === 40 ? 'Easy' : moves === 30 ? 'Medium' : 'Hard';
        // Restart the timer
        // startTimer();
    }

    // Initialize the puzzle board and start the timer
    renderBoard();
    // startTimer();
});

