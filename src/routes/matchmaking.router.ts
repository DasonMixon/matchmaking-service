import express from "express";

export const lobbyRouter = express.Router();

lobbyRouter.post('/queue', (req, res) => {
    // When queueing the lobby preferences should contain the game mode type as one of the key/values

    // Lobby queuing for matchmaking
});

lobbyRouter.post('/dequeue', (req, res) => {
    // Lobby dequeuing for matchmaking
});