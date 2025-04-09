let gameInProgress = false;
let gameState = null;

function getCurrentTime() {
  return new Date().toISOString();
}

function createNewBoard(width, height, fleet) {
  const board = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(null);
    }
    board.push(row);
  }

  const occupied = new Set();
  const playerFleet = [];

  fleet.map((ship, i) => {
    const shipSize = i + 2;
    const shipCount = ship[0]; // total ships of this type
    const afloat = ship[1];
    const type = getShipNameByIndex(i);

    for (let n = 0; n < shipCount; n++) {
      let placed = false;

      while (!placed) {
        const horizontal = Math.random() < 0.5;
        const maxX = horizontal ? width - shipSize : width - 1;
        const maxY = horizontal ? height - 1 : height - shipSize;

        const startX = Math.floor(Math.random() * (maxX + 1));
        const startY = Math.floor(Math.random() * (maxY + 1));

        const positions = [];

        for (let j = 0; j < shipSize; j++) {
          const x = horizontal ? startX + j : startX;
          const y = horizontal ? startY : startY + j;
          positions.push([x, y]);
        }

        // Check if any positions are already occupied
        const collision = positions.some(([x, y]) => occupied.has(`${x},${y}`));
        if (!collision) {
          positions.forEach(([x, y]) => {
            board[y][x] = type[0]; // Or use 'S' if you prefer generic ship marker
            occupied.add(`${x},${y}`);
          });

          playerFleet.push({
            type,
            size: shipSize,
            total: shipCount,
            afloat,
            position: positions
          });

          placed = true;
        }
      }
    }
  });

  gameState = playerFleet;

  return board; 
}

function getShipNameByIndex(index) {
  const shipNames = ['Destroyer', 'Cruiser/Submarine', 'Battleship', 'Carrier'];
  return shipNames[index];
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

  const [x, y] = grid;

  gameState = {
    gridSize: { x, y },
    fleet: fleet.map((ship, i) => ({
      type: getShipNameByIndex(i),
      size: i + 2,
      total: ship[0],
      afloat: ship[1],
    })),
    board: createNewBoard(x, y, fleet),
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

    if (gameState.board[y][x] != null) {
      status = 'hit';
      gameState.board[y][x] = 'X';
    } else {
      status = 'miss';

    }
  
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

  PrintableBoard = "";

  
  for (let i = 0; i < gameState.gridSize.x + 2; i++) {
    PrintableBoard += "-";
  }
  PrintableBoard+= "\n"

  for (let i = 0; i < gameState.board.length; i++) {
    PrintableBoard+= "|"
    const cell = gameState.board[i];
    PrintableBoard += (cell !== null) ? cell : ".";
    PrintableBoard+= "|\n"
  }

  for (let i = 0; i < gameState.gridSize.x + 2; i++) {
    PrintableBoard += "-";
  }


  res.status(200).json({
    message: 'Current game board',
    board: PrintableBoard,
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
