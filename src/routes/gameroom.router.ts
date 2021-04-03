import express from "express";

export const gameRoomRouter = express.Router();

gameRoomRouter.post('/leave', (req, res) => {
    // Player leaving the game room
});