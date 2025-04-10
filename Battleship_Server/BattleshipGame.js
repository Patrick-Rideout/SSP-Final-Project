class BattleshipGame {
    constructor() {
      this.resetGame();
    }
  
    resetGame() {
      this.gameInProgress = false;
      this.userFleet = null;
      this.serverFleet = null;
      this.serverBoard = null;
      this.userBoard = null;
      this.cycle = 0;
      this.startTime = null;
      this.lastServerGuess = null;
      this.serverShips = [];
      this.userShips = [];
    }
  
    newGame(grid = [10, 10], fleet = [[1, 1], [2, 2], [1, 1], [1, 1]]) {
      if (this.gameInProgress) {
        return { status: 'reject' };
      }
  
      this.resetGame();
      this.gameInProgress = true;
      this.startTime = Date.now();
      this.gridSize = grid;
      this.initializeServerFleet(fleet);
      this.initializeUserFleet(fleet);
  
      return {
        status: 'started',
        message: 'New game. You start',
        cycle: this.cycle,
        time: this.startTime
      };
    }
  
    initializeServerFleet(fleet) {
      this.serverShips = [
        { name: 'Destroyer', size: 2, count: fleet[0][0], afloat: fleet[0][1], positions: [] },
        { name: 'Submarine/Cruiser', size: 3, count: fleet[1][0], afloat: fleet[1][1], positions: [] },
        { name: 'Battleship', size: 4, count: fleet[2][0], afloat: fleet[2][1], positions: [] },
        { name: 'Carrier', size: 5, count: fleet[3][0], afloat: fleet[3][1], positions: [] }
      ];
  
      this.serverBoard = Array(this.gridSize[0]).fill().map(() => Array(this.gridSize[1]).fill(0));
      this.placeShips(this.serverShips, this.serverBoard);
    }
  
    initializeUserFleet(fleet) {
      this.userShips = [
        { name: 'Destroyer', size: 2, count: fleet[0][0], afloat: fleet[0][1], positions: [] },
        { name: 'Submarine/Cruiser', size: 3, count: fleet[1][0], afloat: fleet[1][1], positions: [] },
        { name: 'Battleship', size: 4, count: fleet[2][0], afloat: fleet[2][1], positions: [] },
        { name: 'Carrier', size: 5, count: fleet[3][0], afloat: fleet[3][1], positions: [] }
      ];
  
      this.userBoard = Array(this.gridSize[0]).fill().map(() => Array(this.gridSize[1]).fill(0));
    }
  
    placeShips(ships, board) {
      ships.forEach(shipType => {
        for (let i = 0; i < shipType.count; i++) {
          let placed = false;
          while (!placed) {
            const horizontal = Math.random() < 0.5;
            let x, y;
  
            if (horizontal) {
              x = Math.floor(Math.random() * (this.gridSize[0] - shipType.size));
              y = Math.floor(Math.random() * this.gridSize[1]);
            } else {
              x = Math.floor(Math.random() * this.gridSize[0]);
              y = Math.floor(Math.random() * (this.gridSize[1] - shipType.size));
            }
  
            let canPlace = true;
            const positions = [];
  
            for (let s = 0; s < shipType.size; s++) {
              const checkX = horizontal ? x + s : x;
              const checkY = horizontal ? y : y + s;
              
              if (board[checkX][checkY] !== 0) {
                canPlace = false;
                break;
              }
              positions.push([checkX, checkY]);
            }
  
            if (canPlace) {
              for (const [px, py] of positions) {
                board[px][py] = 1; // 1 represents a ship
              }
              shipType.positions.push(positions);
              placed = true;
            }
          }
        }
      });
    }
  
    lob(grid) {
      if (!this.gameInProgress) {
        return { status: 'reject', time: Date.now() };
      }
  
      this.cycle++;
      const [x, y] = grid;
  
      // Check if hit on server's board
      let hit = false;
      let sunk = false;
      let defeated = false;
      let shipTypeHit = null;
  
      if (this.serverBoard[x][y] === 1) {
        hit = true;
        this.serverBoard[x][y] = 2; // Mark as hit
  
        // Check which ship was hit
        for (const shipType of this.serverShips) {
          for (const positions of shipType.positions) {
            if (positions.some(([px, py]) => px === x && py === y)) {
              shipTypeHit = shipType;
              
              // Check if all positions of this ship are hit
              const allHit = positions.every(([px, py]) => this.serverBoard[px][py] === 2);
              if (allHit) {
                shipType.afloat--;
                sunk = true;
                
                // Check if all ships are sunk
                if (this.serverShips.every(st => st.afloat === 0)) {
                  defeated = true;
                }
              }
              break;
            }
          }
          if (shipTypeHit) break;
        }
      }
  
      // Generate server's guess
      const serverGuess = this.generateServerGuess();
      this.lastServerGuess = serverGuess;
  
      if (defeated) {
        const duration = Date.now() - this.startTime;
        this.gameInProgress = false;
        
        return {
          status: 'concede',
          message: 'You win',
          cycle: this.cycle,
          duration: duration,
          myfleet: this.getFleetStatus(this.serverShips),
          yourfleet: this.getFleetStatus(this.userShips),
          time: Date.now()
        };
      } else if (sunk) {
        return {
          status: 'sunk',
          grid: serverGuess,
          cycle: this.cycle,
          time: Date.now()
        };
      } else if (hit) {
        return {
          status: 'hit',
          grid: serverGuess,
          cycle: this.cycle,
          time: Date.now()
        };
      } else {
        return {
          status: 'miss',
          grid: serverGuess,
          cycle: this.cycle,
          time: Date.now()
        };
      }
    }
  
    generateServerGuess() {
      // Simple random guess for now - could be enhanced with smarter AI
      let x, y;
      do {
        x = Math.floor(Math.random() * this.gridSize[0]);
        y = Math.floor(Math.random() * this.gridSize[1]);
      } while (this.userBoard[x][y] === 2 || this.userBoard[x][y] === 3); // Don't guess already guessed spots
      
      return [x, y];
    }
  
    reportHit() {
      if (!this.gameInProgress || !this.lastServerGuess) {
        return { status: 'reject', message: 'Unexpected', time: Date.now() };
      }
  
      const [x, y] = this.lastServerGuess;
      this.userBoard[x][y] = 2; // Mark as hit
  
      // Check which ship was hit
      for (const shipType of this.userShips) {
        for (const positions of shipType.positions) {
          if (positions.some(([px, py]) => px === x && py === y)) {
            // Check if all positions of this ship are hit
            const allHit = positions.every(([px, py]) => this.userBoard[px][py] === 2);
            if (allHit) {
              shipType.afloat--;
            }
            break;
          }
        }
      }
  
      this.lastServerGuess = null;
      return { status: 'ok' };
    }
  
    reportMiss() {
      if (!this.gameInProgress || !this.lastServerGuess) {
        return { status: 'reject', message: 'Unexpected', time: Date.now() };
      }
  
      const [x, y] = this.lastServerGuess;
      this.userBoard[x][y] = 3; // Mark as miss
      this.lastServerGuess = null;
      return { status: 'ok' };
    }
  
    concede() {
      if (!this.gameInProgress) {
        return { status: 'reject', time: Date.now() };
      }
  
      const duration = Date.now() - this.startTime;
      this.gameInProgress = false;
      
      return {
        status: 'ended',
        message: 'I win. Thank you for playing.',
        cycle: this.cycle,
        duration: duration,
        myfleet: this.getFleetStatus(this.serverShips),
        yourfleet: this.getFleetStatus(this.userShips),
        time: Date.now()
      };
    }
  
    cancel() {
      if (!this.gameInProgress) {
        return { status: 'reject', time: Date.now() };
      }
  
      const duration = Date.now() - this.startTime;
      this.gameInProgress = false;
      
      return {
        status: 'ended',
        message: 'Game over. Thank you for playing',
        cycle: this.cycle,
        duration: duration,
        myfleet: this.getFleetStatus(this.serverShips),
        yourfleet: this.getFleetStatus(this.userShips),
        time: Date.now()
      };
    }
  
    status() {
      if (!this.gameInProgress) {
        return { status: 'reject', time: Date.now() };
      }
  
      return {
        status: 'in progress',
        cycle: this.cycle,
        duration: Date.now() - this.startTime,
        myfleet: this.getFleetStatus(this.serverShips),
        yourfleet: this.getFleetStatus(this.userShips),
        time: Date.now()
      };
    }
  
    getFleetStatus(ships) {
      return ships.map(ship => [ship.count, ship.afloat]);
    }
  
    print() {
        if (!this.gameInProgress) {
          return { status: 'reject', message: 'No game in progress', time: Date.now() };
        }
      
        // Create a simple text representation of the server's board (for debugging)
        const serverBoardText = this.createBoardText(this.serverBoard, true);
        const userBoardText = this.createBoardText(this.userBoard, false);
      
        return {
          status: 'ok',
          message: 'Current game state',
          serverBoard: serverBoardText,
          userBoard: userBoardText,
          cycle: this.cycle,
          time: Date.now()
        };
      }
      
      // Helper method to create board text representation
      createBoardText(board, isServerBoard) {
        if (!board) return 'No board data';
        
        const rows = [];
        const size = board.length;
        
        // Add column headers (A, B, C, ...)
        let header = '   ';
        for (let i = 0; i < size; i++) {
          header += String.fromCharCode(65 + i) + ' ';
        }
        rows.push(header);
        
        // Add each row with row number
        for (let y = 0; y < size; y++) {
          let rowStr = (y < 10 ? ' ' : '') + y + ' ';
          for (let x = 0; x < size; x++) {
            if (isServerBoard) {
              // For server board, show hits/misses but not ships (like a player would see)
              if (board[x][y] === 2) rowStr += 'X ';  // Hit
              else if (board[x][y] === 3) rowStr += 'O ';  // Miss
              else rowStr += '. ';  // Unknown
            } else {
              // For user board, show everything (for debugging)
              if (board[x][y] === 0) rowStr += '. ';  // Empty
              else if (board[x][y] === 1) rowStr += 'S ';  // Ship
              else if (board[x][y] === 2) rowStr += 'X ';  // Hit
              else if (board[x][y] === 3) rowStr += 'O ';  // Miss
            }
          }
          rows.push(rowStr);
        }
        
        return rows.join('\n');
      }
  }
  
  module.exports = new BattleshipGame();