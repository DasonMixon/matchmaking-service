import express from "express";
import { Player, IPlayer } from "./../models/player";
import { Lobby, LobbyStatus } from "./../models/lobby";
import { MatchmakingTicket, TicketStatus } from "./../models/matchmakingticket";
import { body } from 'express-validator';
import validateRequest from './../middleware/validateRequest';
import { Games } from "./../models/gamedefinition";

export const lobbyRouter = express.Router();

lobbyRouter.post('/create',
    body('username').isString().isLength({ min: 1, max: 25 }),
    body('gameType').isString().isLength({ min: 1 }),
    validateRequest,
    async (req, res) => {
        try {
            const { username, gameTypeRaw } = req.body;
            const gameType : Games = Games[gameTypeRaw as keyof typeof Games];
            const player: IPlayer = Player.build({ username });
            const lobby = Lobby.build({
                players: [player],
                playerOwnerId: player.id,
                preferences: new Map<string, string>([
                    ['gameType', gameType]
                ])
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

            if (lobby.status !== LobbyStatus.Created)
                return res.status(400).send({error: `Lobby with id '${lobbyId}' is not currently joinable.`});

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

            // If a player leaves while the lobby is matchmaking then cancel the matchmaking ticket
            if (lobby.status === LobbyStatus.Matchmaking) {
                lobby.status = LobbyStatus.Created;
                const matchmakingTicket = await MatchmakingTicket.findOne({ 'lobby._id': lobbyId }); // TODO: Make sure this has an index when used as a subdocument
                if (matchmakingTicket !== null) {
                    matchmakingTicket.status = TicketStatus.Cancelled;
                    await matchmakingTicket.validate();
                    await matchmakingTicket.save();
                }
            }

            // If there are no players left in the lobby disband it
            if (lobby.players.length === 0)
                lobby.status = LobbyStatus.Disbanded;
            // If the player owner just left reassign it to someone else
            else if (lobby.playerOwnerId === playerId)
                lobby.playerOwnerId = lobby.players[0].id;

            await lobby.validate();
            await lobby.save();
            return res.status(200).send(lobby);
        } catch (err) {
            console.log(err);
            return res.status(500).send({error: err});
        }
    });