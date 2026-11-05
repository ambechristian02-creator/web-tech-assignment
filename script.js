const board = document.getElementById("board");
const turnDisplay = document.getElementById("turn");
const messageDisplay = document.getElementById("message");
const restartButton = document.getElementById("restart");

let gameBoard = [];
let currentPlayer = "r";
let selectedPiece = null;
let possibleMoves = [];
let mustContinue = false;
let gameOver = false;

// STEP 1: CREATE THE BOARD

function createBoard() {

    gameBoard = [];

    for (let row = 0; row < 8; row++) {

        gameBoard[row] = [];

        for (let col = 0; col < 8; col++) {

            gameBoard[row][col] = null;

            if ((row + col) % 2 === 1) {

                if (row < 3) {
                    gameBoard[row][col] = "b";
                }

                if (row > 4) {
                    gameBoard[row][col] = "r";
                }
            }
        }
    }

    currentPlayer = "r";
    selectedPiece = null;
    possibleMoves = [];
    mustContinue = false;
    gameOver = false;

    messageDisplay.textContent = "Select a piece to play";

    updateTurn();
    drawBoard();
}

// STEP 2: DISPLAY THE BOARD

function drawBoard() {

    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("button");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            if (
                selectedPiece &&
                selectedPiece.row === row &&
                selectedPiece.col === col
            ) {
                square.classList.add("selected");
            }

            const moveExists = possibleMoves.some(move =>
                move.row === row && move.col === col
            );

            if (moveExists) {
                square.classList.add("valid-move");
            }

            const piece = gameBoard[row][col];

            if (piece) {

                const pieceElement = document.createElement("div");

                pieceElement.classList.add("piece");

                if (piece.toLowerCase() === "r") {
                    pieceElement.classList.add("red");
                } else {
                    pieceElement.classList.add("black");
                }

                if (piece === "R" || piece === "B") {
                    pieceElement.classList.add("king");
                    pieceElement.textContent = "K";
                }

                square.appendChild(pieceElement);
            }

            square.addEventListener("click", () => {
                handleClick(row, col);
            });

            board.appendChild(square);
        }
    }
}

// STEP 3: CHECK THE DIRECTION OF MOVEMENT

function getDirections(piece) {

    if (piece === "R" || piece === "B") {
        return [-1, 1];
    }

    if (piece === "r") {
        return [-1];
    }

    return [1];
}

// STEP 4: FIND POSSIBLE MOVES FOR A PIECE

function getMoves(row, col) {

    const piece = gameBoard[row][col];

    if (!piece) {
        return [];
    }

    const directions = getDirections(piece);
    const moves = [];

    for (let direction of directions) {

        for (let side of [-1, 1]) {

            const newRow = row + direction;
            const newCol = col + side;

            if (
                newRow >= 0 && newRow < 8 &&
                newCol >= 0 && newCol < 8
            ) {

                if (gameBoard[newRow][newCol] === null) {

                    moves.push({
                        row: newRow,
                        col: newCol,
                        capture: false
                    });

                } else if (
                    gameBoard[newRow][newCol].toLowerCase() !==
                    piece.toLowerCase()
                ) {

                    const jumpRow = row + direction * 2;
                    const jumpCol = col + side * 2;

                    if (
                        jumpRow >= 0 && jumpRow < 8 &&
                        jumpCol >= 0 && jumpCol < 8 &&
                        gameBoard[jumpRow][jumpCol] === null
                    ) {

                        moves.push({
                            row: jumpRow,
                            col: jumpCol,
                            capture: true,
                            capturedRow: newRow,
                            capturedCol: newCol
                        });
                    }
                }
            }
        }
    }

    return moves;
}

// STEP 5: CHECK WHETHER A CAPTURE IS AVAILABLE

function getAllMoves() {

    let allMoves = [];
    let captureMoves = [];

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = gameBoard[row][col];

            if (piece && piece.toLowerCase() === currentPlayer) {

                const moves = getMoves(row, col);

                for (let move of moves) {

                    allMoves.push({
                        fromRow: row,
                        fromCol: col,
                        ...move
                    });

                    if (move.capture) {
                        captureMoves.push({
                            fromRow: row,
                            fromCol: col,
                            ...move
                        });
                    }
                }
            }
        }
    }

    return captureMoves.length > 0 ? captureMoves : allMoves;
}

// STEP 6: HANDLE PLAYER CLICKS

function handleClick(row, col) {

    if (gameOver) {
        return;
    }

    if (selectedPiece) {

        const move = possibleMoves.find(move =>
            move.row === row && move.col === col
        );

        if (move) {
            makeMove(move);
            return;
        }
    }

    const piece = gameBoard[row][col];

    if (piece && piece.toLowerCase() === currentPlayer) {

        if (mustContinue) {
            return;
        }

        const allMoves = getAllMoves();

        const pieceMoves = allMoves.filter(move =>
            move.fromRow === row && move.fromCol === col
        );

        if (pieceMoves.length > 0) {

            selectedPiece = {
                row: row,
                col: col
            };

            possibleMoves = pieceMoves;

            drawBoard();

            messageDisplay.textContent = "Choose a highlighted square";

        } else {

            messageDisplay.textContent = "This piece cannot move";
        }

    } else {

        if (!mustContinue) {
            selectedPiece = null;
            possibleMoves = [];
            drawBoard();
            messageDisplay.textContent = "Select one of your pieces";
        }
    }
}

// STEP 7: MOVE A PIECE

function makeMove(move) {

    const fromRow = selectedPiece.row;
    const fromCol = selectedPiece.col;

    let piece = gameBoard[fromRow][fromCol];

    gameBoard[move.row][move.col] = piece;
    gameBoard[fromRow][fromCol] = null;

    if (move.capture) {

        gameBoard[move.capturedRow][move.capturedCol] = null;
    }

    selectedPiece = {
        row: move.row,
        col: move.col
    };

    // PROMOTE A PIECE TO KING

    if (piece === "r" && move.row === 0) {
        gameBoard[move.row][move.col] = "R";
    }

    if (piece === "b" && move.row === 7) {
        gameBoard[move.row][move.col] = "B";
    }

    // CHECK FOR ANOTHER CAPTURE

    if (move.capture) {

        const nextCaptures = getMoves(move.row, move.col).filter(move =>
            move.capture
        );

        if (nextCaptures.length > 0) {

            mustContinue = true;
            possibleMoves = nextCaptures;

            messageDisplay.textContent = "Capture again with the same piece!";

            drawBoard();
            return;
        }
    }

    mustContinue = false;
    selectedPiece = null;
    possibleMoves = [];

    // CHANGE PLAYER

    currentPlayer = currentPlayer === "r" ? "b" : "r";

    updateTurn();
    drawBoard();

    checkWinner();
}

// STEP 8: UPDATE THE PLAYER TURN

function updateTurn() {

    if (currentPlayer === "r") {
        turnDisplay.textContent = "Red Player's Turn";
        turnDisplay.style.color = "#ff6868";
    } else {
        turnDisplay.textContent = "Black Player's Turn";
        turnDisplay.style.color = "#cccccc";
    }
}

// STEP 9: CHECK THE WINNER

function checkWinner() {

    let redPieces = 0;
    let blackPieces = 0;

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = gameBoard[row][col];

            if (piece) {

                if (piece.toLowerCase() === "r") {
                    redPieces++;
                } else {
                    blackPieces++;
                }
            }
        }
    }

    if (redPieces === 0 || getAllMoves().length === 0) {

        gameOver = true;
        turnDisplay.textContent = "Black Player Wins!";
        messageDisplay.textContent = "Game Over";

        return;
    }

    if (blackPieces === 0 || getAllMoves().length === 0) {

        gameOver = true;
        turnDisplay.textContent = "Red Player Wins!";
        messageDisplay.textContent = "Game Over";

        return;
    }

    messageDisplay.textContent = "Select a piece to play";
}

// STEP 10: RESTART THE GAME

restartButton.addEventListener("click", createBoard);

// START THE GAME

createBoard();