class BattleshipGame {
  constructor() {
    this.resetGame();
  }

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

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  newGame(grid, fleet) {
    if (this.active) return { status: 'reject' };

    this.resetGame();
    this.active = true;
    this.startTime = Date.now();
    this.gridSize = grid;
    this.userFleet = JSON.parse(JSON.stringify(fleet));
    this.serverFleet = JSON.parse(JSON.stringify(fleet));
    this.serverBoard = Array.from({ length: grid[1] }, () => Array(grid[0]).fill(null));

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

  placeShip(typeIndex, size) {
    let success = false;

    while (!success) {
      const horizontal = Math.random() < 0.5;
      const xMax = horizontal ? this.gridSize[0] - size : this.gridSize[0] - 1;
      const yMax = horizontal ? this.gridSize[1] - 1 : this.gridSize[1] - size;
      const x = this.getRandomInt(xMax + 1);
      const y = this.getRandomInt(yMax + 1);
      const coords = [];

      for (let i = 0; i < size; i++) {
        const xi = horizontal ? x + i : x;
        const yi = horizontal ? y : y + i;
        if (this.serverBoard[yi][xi] !== null) {
          coords.length = 0;
          break;
        }
        coords.push([xi, yi]);
      }

      if (coords.length === size) {
        const ship = { id: this.serverShips.length, type: typeIndex, size, hits: [], coords };
        this.serverShips.push(ship);
        coords.forEach(([xi, yi]) => this.serverBoard[yi][xi] = ship.id);
        success = true;
      }
    }
  }

  lob([x, y]) {
    if (!this.active) return { status: 'reject', time: Date.now() };

    this.cycle++;
    const tile = this.serverBoard[y]?.[x];
    const serverGuess = [
      this.getRandomInt(this.gridSize[0]),
      this.getRandomInt(this.gridSize[1])
    ];
    this.lastServerGuess = serverGuess;

    if (tile !== null && tile !== undefined) {
      const ship = this.serverShips[tile];
      if (!ship.hits.some(([hx, hy]) => hx === x && hy === y)) {
        ship.hits.push([x, y]);

        const fullyHit = ship.hits.length === ship.size;
        if (fullyHit) {
          this.serverFleet[ship.type][1]--;
          const allSunk = this.serverFleet.every(([_, afloat]) => afloat === 0);

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
