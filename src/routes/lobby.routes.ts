import express from "express";

export const lobbyRouter = express.Router();

lobbyRouter.post('/create', (req, res) => {
    // Player creating a lobby
});

lobbyRouter.post('/join', (req, res) => {
    // Player joining a lobby
});

lobbyRouter.post('/leave', (req, res) => {
    // Player leaving a lobby
});