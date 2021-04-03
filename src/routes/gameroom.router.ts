import express from "express";
import { body } from "express-validator";
import validateRequest from "./../middleware/validateRequest";
import { GameRoom, GameStatus } from "./../models/gameroom";

export const gameRoomRouter = express.Router();

gameRoomRouter.post('/leave',
    body('gameRoomId').isUUID(),
    body('playerId').isUUID(),
    validateRequest,
    async (req, res) => {
        try {
            const { gameRoomId, playerId } = req.body;
            const gameRoom = await GameRoom.findById(gameRoomId);
            if (gameRoom === null)
                return res.status(400).send({error: `Game room with id '${gameRoomId}' does not exist.`});

            const player = gameRoom.players.find((player) => player.id === playerId);
            if (player === undefined)
                return res.status(400).send({error: `Player with id '${playerId}' does not exist in gamee room '${gameRoomId}'.`});

                gameRoom.players.forEach((item, index) => {
                if(item === player)
                    gameRoom.players.splice(index, 1);
            });

            // If there's one or no players left mark the status as completed
            if (gameRoom.players.length === 0)
                gameRoom.status = GameStatus.Completed;

            await gameRoom.validate();
            await gameRoom.save();
            return res.status(200).send(gameRoom);
        } catch (err) {
            console.log(err);
            return res.status(500).send({error: err});
        }
    });

gameRoomRouter.post('/complete',
    body('gameRoomId').isUUID(),
    validateRequest,
    async (req, res) => {
        try {
            const { gameRoomId } = req.body;
            const gameRoom = await GameRoom.findById(gameRoomId);
            if (gameRoom === null)
                return res.status(400).send({error: `Game room with id '${gameRoomId}' does not exist.`});
            
            gameRoom.status = GameStatus.Completed;

            await gameRoom.validate();
            await gameRoom.save();
            return res.status(200).send(gameRoom);
        } catch (err) {
            console.log(err);
            return res.status(500).send({error: err});
        }
    });
