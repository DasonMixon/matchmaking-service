import express from "express";

export const lobbyRouter = express.Router();

lobbyRouter.post('/queue', (req, res) => {
    // Lobby queuing for matchmaking
});

lobbyRouter.post('/dequeue', (req, res) => {
    // Lobby dequeuing for matchmaking
});