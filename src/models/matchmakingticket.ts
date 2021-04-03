import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { lobbySchema, ILobby } from './lobby';

enum TicketStatus {
    Submitted = 'Submitted',
    Pending = 'Pending',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
}

interface IMatchmakingTicket {
    id: string;
    lobby: Partial<ILobby>;
    status: TicketStatus;
    createdDate: Date;
}

interface MatchmakingTicketModelInterface extends mongoose.Model<MatchmakingTicketDoc> {
    build(attr: Partial<IMatchmakingTicket>): MatchmakingTicketDoc;
}

interface MatchmakingTicketDoc extends mongoose.Document {
    id: string;
    lobby: Partial<ILobby>;
    status: TicketStatus;
    createdDate: Date;
}

const matchmakingTicketSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required: true
    },
    lobby: lobbySchema,
    status: {
        type: String,
        enum: TicketStatus,
        required: true,
        default: TicketStatus.Submitted
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

matchmakingTicketSchema.statics.build = (attr: Partial<IMatchmakingTicket>) => {
    return new MatchmakingTicket(attr);
}

const MatchmakingTicket = mongoose.model<MatchmakingTicketDoc, MatchmakingTicketModelInterface>('MatchmakingTicket', matchmakingTicketSchema);

export { MatchmakingTicket, IMatchmakingTicket, TicketStatus }