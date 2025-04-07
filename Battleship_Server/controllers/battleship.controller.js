let gameInProgress = false;
let gameState = null;

function getCurrentTime() {
  return new Date().toISOString();
}

function createEmptyBoard(width, height) {
  const board = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    
    for (let x = 0; x < width; x++) {
      row.push(null);
    }
    
    board.push(row);
  }
  return board;
}

function getShipNameByIndex(index) {
  const shipNames = ['Destroyer', 'Cruiser/Submarine', 'Battleship', 'Carrier'];
  return shipNames[index];
}

function createLetterBoard(grid) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Use up to 26 columns (you can extend this if needed)
    let boardView = '';
  
    // Loop through each row (height of the board)
    for (let y = 0; y < grid.length; y++) {
      let row = '';
  
      // Loop through each column (width of the board)
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x] === null ? ' ' : grid[y][x]; // Use space if null, or show the content (like a ship)
        row += `${cell} `;
      }
  
      // Append the row to the board string, with a newline after each row
      boardView += `${letters[y]} ${row.trim()}\n`; // Label rows with letters
    }
  
    return boardView;
}

const newGame = (req, res) => {

  if (gameInProgress) {
    return res.status(408).json({ message: 'Game already in progress' });
  }

  const { grid, fleet } = req.body;

  if (!grid || !fleet) {
    return res.status(400).json({ message: 'Grid/Fleet Error' });
  }

  if (!Array.isArray(grid) || !Array.isArray(fleet)) {
    return res.status(400).json({ message: 'Grid/Fleet Error' });
  }

  const [width, height] = grid;

  gameState = {
    gridSize: { width, height },
    fleet: fleet.map((ship, i) => ({
      type: getShipNameByIndex(i),
      size: i + 2,
      total: ship[0],
      afloat: ship[1],
    })),
    board: createEmptyBoard(width, height),
    currentPlayer: 'Player1',
    isGameOver: false,
    serverMoves: [],
    playerMoves: [],
    cycle: 0,
    startTime: getCurrentTime(),
    serverFleet: [],
    playerFleet: []
  };

  gameInProgress = true;

  res.status(200).json({
    status: 'started',
    message: 'New game. You start',
    cycle: gameState.cycle,
    time: gameState.startTime
  });
};

const lob = (req, res) => {

    let status = 'miss';
    let sunk = false;

    if (!gameInProgress) {
      return res.status(400).json({
        status: 'reject',
        message: 'No game in progress',
        time: getCurrentTime()
      });
    }
  
    const { grid } = req.body;
    if (!grid) {
      return res.status(400).json({
        status: 'reject',
        message: 'No input recieved',
        time: getCurrentTime()
      });
    }
  
    let [x, y] = grid;
  
    // if (x >= 0 && x < gameState.gridSize.width) {
    //   return res.status(400).json({
    //     status: 'reject',
    //     message: 'Invalid coordinates',
    //     time: getCurrentTime()
    //   });
    // }

    // if (y >= 0 && y < gameState.gridSize.height) {
    //     return res.status(400).json({
    //       status: 'reject',
    //       message: 'Invalid coordinates',
    //       time: getCurrentTime()
    //     });
    //   }
    
    if (gameState.board[y][x] !== null) {
      status = 'hit';
      gameState.board[y][x] = 'hit';
      gameState.playerFleet.forEach((ship) => {
        if (ship.position[0] === x && ship.position[1] === y) {
          ship.afloat--;
        }
      });
  
      // Check if any ship is sunk (i.e., all parts of the ship are hit)
      sunk = gameState.playerFleet.every((ship) => ship.afloat === 0);
  
      if (sunk) {
        // If all ships are sunk, the game ends
        return res.status(200).json({
          status: 'sunk',
          grid: [x, y],
          cycle: ++gameState.cycle,
          time: getCurrentTime(),
        });
      }
    } else {
      // It's a miss
      gameState.board[y][x] = 'miss'; // Mark it as miss
    }
  
    // Update cycle and return response
    res.status(200).json({
      status: status,
      grid: [x, y],
      cycle: ++gameState.cycle,
      time: getCurrentTime(),
    });
  
    // Check if the game is over
    const allShipsSunk = gameState.playerFleet.every(ship => ship.afloat === 0);
    if (allShipsSunk) {
      // If all ships are sunk, the game ends, and the opponent wins
      return res.status(200).json({
        status: 'concede',
        message: 'You win',
        cycle: gameState.cycle,
        duration: new Date() - new Date(gameState.startTime), // Calculate game duration
        myfleet: gameState.playerFleet.map(ship => [ship.size, ship.afloat]),
      });
    }
  };

const printGrid = (req, res) => {

    if (!gameInProgress) {
    return res.status(400).json({ message: 'No game in progress' });
  }

  // Use the existing helper function to format the board
  const letterBoard = createLetterBoard(gameState.board);

  // Respond with the formatted board
  res.status(200).json({
    message: 'Current game board',
    board: letterBoard, // Send the board as a string representation
  });
};

const hit = (req, res) => {
    // TODO: handle hit logic
    res.status(200).json({ message: 'Hit registered' });
};

const miss = (req, res) => {
    // TODO: handle miss logic
    res.status(200).json({ message: 'Miss registered' });
};

const concede = (req, res) => {
    // TODO: mark current player as losing
    gameState.isGameOver = true;
    res.status(200).json({ message: 'Player conceded. Game over.' });
};

const cancel = (req, res) => {
    // TODO: cancel the current game
    gameState = {};
    res.status(200).json({ message: 'Game cancelled' });
};

const status = (req, res) => {
    // Return the current game state
    res.status(200).json({ message: 'Current game status', game: gameState });
};

module.exports = { newGame, lob, printGrid, hit, miss, concede, cancel, status };
