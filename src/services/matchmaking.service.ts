import { MatchmakingTicket, MatchmakingTicketDoc, TicketStatus } from "./../models/matchmakingticket";
import _ from 'lodash';
import { GameRoom } from "./../models/gameroom";

let matchmakingLoop : any = null;
let executing = false;

const start = () => {
    matchmakingLoop = setInterval(() => {
        if (!executing)
            execute();
    }, 1000);
}

// TODO: Need to implement locking / single processing instance if we want to scale
// this service out or else they're gonna be stomping on eachother
const execute = async () => {
    try {
        executing = true;

        // Get all matchmaking tickets that are in Submitted status
        const submittedTickets = await MatchmakingTicket.find({ 'status': TicketStatus.Submitted });

        // Group tickets based on their game modes
        const gameModeTickets: _.Dictionary<MatchmakingTicketDoc[]> = _.groupBy(submittedTickets, (ticket) => ticket.lobby.preferences.get('gameMode'));
        _.each(gameModeTickets, (group) => {
            // Now for each group of players in a game mode, get people from the same MMR level matched.
            // If one of the queued lobbies has more than one person then take the average MMR
            const orderedByMMR: MatchmakingTicketDoc[] = _.orderBy(group, (ticket) => [_.meanBy(ticket.lobby.players, (player) => parseInt(player.attributes.get('MMR'))), ticket.createdDate]);

            // Split the orderByMMR above into groups of 8
            const potentialGameRooms = _.chunk(orderedByMMR, 8); // TODO: This isn't correct, we need to chunk to 8 players not 8 tickets as tickets can have more than 1 player

            // If a chunk still has all tickets as Submitted status, create a game room and move the tickets to Pending
            potentialGameRooms.forEach(async (chunk) => {
                const ticketIds = chunk.map(c => c.id);
                const refreshedTickets = await MatchmakingTicket.find({ '_id': { $in: ticketIds } });
                if (refreshedTickets.filter(t => t.status === TicketStatus.Submitted).length === 8) {
                    // Only process this chunk if all 8 tickets still exist and are in Submitted status
                    // TODO: Utilize bulk update here
                    refreshedTickets.forEach(async rt => {
                        rt.status = TicketStatus.Pending;
                        await rt.validate();
                        await rt.save();
                    });

                    GameRoom.build({  });
                }
            });
        });
    } finally {
        executing = false;
    }
}

const stop = () => {
    if (matchmakingLoop !== null)
        clearInterval(matchmakingLoop);
};

export { start, stop }