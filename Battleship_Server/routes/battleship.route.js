const express = require('express');
const battleshipRouter = express.Router();

const { newGame, lob, print, hit, miss, concede, cancel, status } = require("../controllers/battleship.controller.js");

battleshipRouter.post('/new', newGame);
battleshipRouter.post('/lob', lob);
battleshipRouter.get('/print', print);
battleshipRouter.post('/hit', hit);
battleshipRouter.post('/miss', miss);
battleshipRouter.post('/concede', concede);
battleshipRouter.post('/cancel', cancel);
battleshipRouter.get('/status', status);

module.exports = battleshipRouter;