const Battleship = require('../BattleshipGame');

const newGame = (req, res) => {
  const grid = req.body.grid || (req.query.grid ? JSON.parse(req.query.grid) : [10, 10]);
  const fleet = req.body.fleet || (req.query.fleet ? JSON.parse(req.query.fleet) : [[1,1],[2,2],[1,1],[1,1]]);

  res.json(Battleship.newGame(grid, fleet));
};

const lob = (req, res) => {
  const grid = req.body.grid;
  
  if (!grid || !Array.isArray(grid)) {
    return res.json({ 
      status: 'reject', 
      message: 'Invalid grid format. Expected {"grid": [x,y]}',
      time: Date.now() 
    });
  }
  
  res.json(Battleship.lob(grid));
};

const print = (req, res) => {
  res.json(Battleship.print());
};

const hit = (req, res) => {
  res.json(Battleship.reportHit());
};

const miss = (req, res) => {
  res.json(Battleship.reportMiss());
};

const concede = (req, res) => {
  res.json(Battleship.concede());
};

const cancel = (req, res) => {
  res.json(Battleship.cancel());
};

const status = (req, res) => {
  res.json(Battleship.status());
};

module.exports = { newGame, lob, print, hit, miss, concede, cancel, status };
