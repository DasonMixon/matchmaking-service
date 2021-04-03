import express from "express";

export const gameDefinitionsRouter = express.Router();

gameDefinitionsRouter.get('/', (req, res) => {
    // Get the list of game definitions from mongo here
});