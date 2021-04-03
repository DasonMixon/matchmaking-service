import express from "express";
import { body } from "express-validator";
import { Lobby, LobbyStatus } from "./../models/lobby";
import validateRequest from "./../middleware/validateRequest";
import { MatchmakingTicket, TicketStatus } from "./../models/matchmakingticket";

export const lobbyRouter = express.Router();

lobbyRouter.post('/queue',
    body('lobbyId').isUUID(),
    body('playerId').isUUID(),
    validateRequest,
    async (req, res) => {
        const { lobbyId, playerId } = req.body;
        const lobby = await Lobby.findById(lobbyId);
        if (lobby === null)
            return res.status(400).send({error: `Lobby with id '${lobbyId}' does not exist.`});

        if (lobby.status !== LobbyStatus.Created)
            return res.status(400).send({error: `Lobby with id '${lobbyId}' is not currently able to start matchmaking.`});

        if (lobby.playerOwnerId !== playerId)
            return res.status(400).send({error: `Player with id '${playerId}' cannot start matchmaking since they are not the lobby owner.`});

        if (!lobby.preferences.has("gameMode"))
            return res.status(400).send({error: `Game Mode is required to start matchmaking.`});

        lobby.status = LobbyStatus.Matchmaking;
        await lobby.validate();
        await lobby.save();

        const ticket = MatchmakingTicket.build({ lobby });
        await ticket.validate();
        await ticket.save();
        return res.status(200).send(ticket);
    });

lobbyRouter.post('/dequeue',
    body('ticketId').isUUID(),
    body('playerId').isUUID(),
    validateRequest,
    async (req, res) => {
        const { ticketId, playerId } = req.body;
        const ticket = await MatchmakingTicket.findById(ticketId);
        if (ticket === null)
            return res.status(400).send({error: `Matchmaking ticket with id '${ticketId}' does not exist.`});

        if (ticket.status === TicketStatus.Completed)
            return res.status(400).send({error: `Cannot dequeue ticket that is already completed.`});

        if (ticket.lobby.playerOwnerId !== playerId)
            return res.status(400).send({error: `Player with id '${playerId}' cannot stop matchmaking since they are not the lobby owner.`});

        ticket.status = TicketStatus.Cancelled;
        await ticket.validate();
        await ticket.save();
        return res.status(200).send(ticket);
    });

lobbyRouter.post('/poll',
    body('ticketId').isUUID(),
    validateRequest,
    async (req, res) => {
        const { ticketId } = req.body;
        const ticket = await MatchmakingTicket.findById(ticketId);
        if (ticket === null)
            return res.status(400).send({error: `Matchmaking ticket with id '${ticketId}' does not exist.`});

        return res.status(200).send(ticket);
    });