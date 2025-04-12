const Battleship = require('../BattleshipGame');

const newGame = (req, res) => {
  const grid = req.body.grid || [10, 10];
  const fleet = req.body.fleet || [[1, 1], [2, 2], [1, 1], [1, 1]];

  try {
    const result = Battleship.newGame(grid, fleet);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to start game",
      error: err.message
    });
  }
};


const lob = (req, res) => {
  const grid = req.body.grid;

  if (!grid || !Array.isArray(grid)) {
    return res.json({ 
      status: 'error', 
      message: 'Invalid grid format.',
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
