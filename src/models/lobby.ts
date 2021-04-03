import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { playerSchema, IPlayer } from './player';

enum LobbyStatus {
    Created = 'Created',
    Matchmaking = 'Matchmaking',
    Disbanded = 'Disbanded'
}

interface ILobby {
    id: string;
    preferences: Map<string, string>;
    players: Array<Partial<IPlayer>>;
    status: LobbyStatus;
    playerOwnerId: string;
    createdDate: Date;
}

interface LobbyModelInterface extends mongoose.Model<LobbyDoc> {
    build(attr: Partial<ILobby>): LobbyDoc;
}

interface LobbyDoc extends mongoose.Document {
    id: string;
    preferences: Map<string, string>;
    players: Array<IPlayer>;
    status: LobbyStatus;
    playerOwnerId: string;
    createdDate: Date;
}

const lobbySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required: true
    },
    preferences: {
        type: Map,
        required: true,
        default: new Map<string, string>()
    },
    players: [playerSchema],
    status: {
        type: String,
        enum: LobbyStatus,
        required: true,
        default: LobbyStatus.Created
    },
    playerOwnerId: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

lobbySchema.statics.build = (attr: Partial<ILobby>) => {
    return new Lobby(attr);
}

const Lobby = mongoose.model<LobbyDoc, LobbyModelInterface>('Lobby', lobbySchema);

export { lobbySchema, Lobby, ILobby, LobbyStatus }