import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IPlayer {
    id: string;
    username: string;
    attributes: Map<string, string>;
    createdDate: Date;
}

interface PlayerModelInterface extends mongoose.Model<PlayerDoc> {
    build(attr: Partial<IPlayer>): PlayerDoc;
}

interface PlayerDoc extends mongoose.Document {
    id: string;
    username: string;
    attributes: Map<string, string>;
    createdDate: Date;
}

const playerSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    attributes: {
        type: Map,
        required: true,
        default: new Map<string, string>()
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

playerSchema.statics.build = (attr: Partial<IPlayer>) => {
    return new Player(attr);
}

const Player = mongoose.model<PlayerDoc, PlayerModelInterface>('Player', playerSchema);

export { playerSchema, Player, IPlayer }