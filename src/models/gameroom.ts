import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IPlayer, playerSchema } from './player';

enum GameStatus {
    InProgress = 'InProgress',
    Completed = 'Completed'
}

interface IGameRoom {
    id: string;
    players: Array<Partial<IPlayer>>;
    status: GameStatus;
    createdDate: Date;
}

interface GameRoomModelInterface extends mongoose.Model<GameRoomDoc> {
    build(attr: IGameRoom): GameRoomDoc;
}

interface GameRoomDoc extends mongoose.Document {
    id: string;
    players: Array<Partial<IPlayer>>;
    status: GameStatus;
    createdDate: Date;
}

const gameRoomSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required: true
    },
    players: [playerSchema],
    status: {
        type: String,
        enum: GameStatus,
        default: GameStatus.InProgress,
        required: true
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

gameRoomSchema.statics.build = (attr: IGameRoom) => {
    return new GameRoom(attr);
}

const GameRoom = mongoose.model<GameRoomDoc, GameRoomModelInterface>('GameRoom', gameRoomSchema);

export { GameRoom, GameStatus, IGameRoom }