import express from "express";
import { Player, IPlayer } from "./../models/player";
import { Lobby } from "./../models/lobby";
import { body } from 'express-validator';
import validateRequest from './../middleware/validateRequest';

export const lobbyRouter = express.Router();

lobbyRouter.post('/create',
    body('username').isString().isLength({ min: 1, max: 25 }),
    validateRequest,
    async (req, res) => {
        try {
            const { username } = req.body;
            const player: Partial<IPlayer> = { username };
            const lobby = Lobby.build({
                players: [player]
            });
            await lobby.validate();
            await lobby.save();
            return res.status(200).send(lobby);
        } catch (err) {
            console.log(err);
            return res.status(500).send({error: err});
        }
    });

lobbyRouter.post('/join',
    body('lobbyId').isUUID(),
    body('username').isString().isLength({ min: 1, max: 25 }),
    validateRequest,
    async (req, res) => {
        try {
            const { lobbyId, username } = req.body;
            const lobby = await Lobby.findById(lobbyId);
            if (lobby === null)
                return res.status(400).send({error: `Lobby with id '${lobbyId}' does not exist.`});

            const existingUsername = lobby.players.find((player) => player.username === username);
            if (existingUsername !== undefined)
                return res.status(400).send({error: `Lobby with id '${lobbyId}' already has player with username '${username}'.`});

            const player: IPlayer = Player.build({ username });
            lobby.players.push(player);

            await lobby.validate();
            await lobby.save();
            return res.status(200).send(lobby);
        } catch (err) {
            console.log(err);
            return res.status(500).send({error: err});
        }
    });

lobbyRouter.post('/leave',
    body('lobbyId').isUUID(),
    body('playerId').isUUID(),
    validateRequest,
    async (req, res) => {
        try {
            const { lobbyId, playerId } = req.body;
            const lobby = await Lobby.findById(lobbyId);
            if (lobby === null)
                return res.status(400).send({error: `Lobby with id '${lobbyId}' does not exist.`});

            const player = lobby.players.find((player) => player.id === playerId);
            if (player === undefined)
                return res.status(400).send({error: `Player with id '${playerId}' does not exist in lobby '${lobbyId}'.`});

            lobby.players.forEach((item, index) => {
                if(item === player)
                    lobby.players.splice(index, 1);
            });

            await lobby.validate();
            await lobby.save();
            return res.status(200).send(lobby);
        } catch (err) {
            console.log(err);
            return res.status(500).send({error: err});
        }
    });