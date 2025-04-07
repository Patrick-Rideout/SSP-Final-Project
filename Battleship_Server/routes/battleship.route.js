const express = require('express');
const battleshipRouter = express.Router();

const { newGame, lob, printGrid, hit, miss, concede, cancel, status } = require("../controllers/battleship.controller.js");

battleshipRouter.get('/new', newGame);
battleshipRouter.post('/lob', lob);
battleshipRouter.get('/print', printGrid);
battleshipRouter.post('/hit', hit);
battleshipRouter.post('/miss', miss);
battleshipRouter.get('/concede', concede);
battleshipRouter.get('/cancel', cancel);
battleshipRouter.get('/status', status);

module.exports = battleshipRouter;