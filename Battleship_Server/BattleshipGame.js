class BattleshipGame {
  constructor() {
    this.resetGame(); 
  }

  // Intializes all functions
  resetGame() {
    this.active = false;
    this.serverBoard = [];
    this.serverShips = [];
    this.userFleet = [];
    this.serverFleet = [];
    this.gridSize = [10, 10];
    this.lastServerGuess = null;
    this.cycle = 0;
  }

  // Random int getter
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  // Starts a new game with provided grid size and fleet layout
  newGame(grid, fleet) {
    if (this.active) return { status: 'reject' };

    this.resetGame();
    this.active = true;
    this.startTime = Date.now();
    this.gridSize = grid;
    this.userFleet = JSON.parse(JSON.stringify(fleet));
    this.serverFleet = JSON.parse(JSON.stringify(fleet));

    // Intializes the servers board to be empty
    this.serverBoard = [];
    for (let y = 0; y < grid[1]; y++) {
      this.serverBoard.push(new Array(grid[0]).fill(null));
    }

    // Puts all ships on servers board
    fleet.forEach(([count], index) => {
      for (let i = 0; i < count; i++) {
        this.placeShip(index, index + 2);
      }
    });

    return {
      status: 'started',
      message: 'New game. You start',
      cycle: this.cycle,
      time: Date.now()
    };
  }

  // Function to place one shit of given type and size
  placeShip(typeIndex, size) {
    let success = false;

    while (!success) {

      // Picks ships orenitation
      let horizontal;
      if (Math.random() < 0.5) {
        horizontal = true;
      } else {
        horizontal = false;
      }

      // Gets max x and y of grid
      let xMax = this.gridSize[0] - 1;
      let yMax = this.gridSize[1] - 1;

      // Prevents ship from being placed off board
      if (horizontal) {
        xMax = this.gridSize[0] - size;
      } else {
        yMax = this.gridSize[1] - size;
      }

      // Chooses random starting X and Y within the allowed range
      const x = this.getRandomInt(xMax + 1);
      const y = this.getRandomInt(yMax + 1);

      const coords = [];

      for (let i = 0; i < size; i++) {
        // if horizontal x increases by 1 and y stays the same (opposite for vertical)
        const xi = horizontal ? x + i : x;
        const yi = horizontal ? y : y + i;
        if (this.serverBoard[yi][xi] !== null) {
          coords.length = 0; // Reset coords if overlap
          break;
        }
        coords.push([xi, yi]);
      }

      // If valid place ship
      if (coords.length === size) {
        const ship = {
          id: this.serverShips.length,
          type: typeIndex,
          size,
          hits: [],
          coords
        };

        this.serverShips.push(ship);
        coords.forEach(([xi, yi]) => {
          this.serverBoard[yi][xi] = ship.id;
        });

        console.log(`${typeIndex} placed at:`, coords);


        success = true;
      }
    }
  }

  lob([x, y]) {
    if (!this.active) return { status: 'reject', time: Date.now() };

    this.cycle++;

    // Gets the tile value at the guessed coordinate
    let tile = null;
    if (this.serverBoard[y] && this.serverBoard[y][x] !== undefined) {
      tile = this.serverBoard[y][x];
    }

    // Generate a new guess for the server tp guess next
    const serverGuess = [
      this.getRandomInt(this.gridSize[0]),
      this.getRandomInt(this.gridSize[1])
    ];
    this.lastServerGuess = serverGuess;

    // If a ship is hit
    if (tile !== null && tile !== undefined) {
      const ship = this.serverShips[tile];

      // Check if that coordinate was already hit
      let alreadyHit = false;
      for (const [hx, hy] of ship.hits) {
        if (hx === x && hy === y) {
          alreadyHit = true;
          break;
        }
      }

      if (!alreadyHit) {
        ship.hits.push([x, y]);

        const fullyHit = ship.hits.length === ship.size;
        if (fullyHit) {
          this.serverFleet[ship.type][1]--;

          let allSunk = true;
          for (let i = 0; i < this.serverFleet.length; i++) {
            const afloat = this.serverFleet[i][1];
            if (afloat !== 0) {
              allSunk = false;
              break;
            }
          }

          if (allSunk) {
            this.active = false;
            return {
              status: 'concede',
              message: 'You win',
              grid: serverGuess,
              cycle: this.cycle,
              duration: Date.now() - this.startTime,
              myfleet: this.serverFleet,
              yourfleet: this.userFleet,
              time: Date.now()
            };
          }

          return { status: 'sunk', grid: serverGuess, cycle: this.cycle, time: Date.now() };
        }

        return { status: 'hit', grid: serverGuess, cycle: this.cycle, time: Date.now() };
      }
    }

    return { status: 'miss', grid: serverGuess, cycle: this.cycle, time: Date.now() };
  }

  reportHit() {
    if (!this.active || !this.lastServerGuess)
      return { status: 'reject', message: 'Unexpected', time: Date.now() };

    this.lastServerGuess = null;
    return { status: 'ok' };
  }

  reportMiss() {
    if (!this.active || !this.lastServerGuess)
      return { status: 'reject', message: 'Unexpected', time: Date.now() };

    this.lastServerGuess = null;
    return { status: 'ok' };
  }

  concede() {
    if (!this.active) return { status: 'reject', time: Date.now() };
    this.active = false;

    return {
      status: 'ended',
      message: 'I win. Thank you for playing.',
      cycle: this.cycle,
      duration: Date.now() - this.startTime,
      myfleet: this.serverFleet,
      yourfleet: this.userFleet,
      time: Date.now()
    };
  }

  cancel() {
    if (!this.active) return { status: 'reject', time: Date.now() };
    this.active = false;

    return {
      status: 'ended',
      message: 'Game over. Thank you for playing',
      cycle: this.cycle,
      duration: Date.now() - this.startTime,
      myfleet: this.serverFleet,
      yourfleet: this.userFleet,
      time: Date.now()
    };
  }

  status() {
    if (!this.active) return { status: 'reject', time: Date.now() };

    return {
      status: 'in progress',
      cycle: this.cycle,
      duration: Date.now() - this.startTime,
      myfleet: this.serverFleet,
      yourfleet: this.userFleet,
      time: Date.now()
    };
  }
}

module.exports = new BattleshipGame();
