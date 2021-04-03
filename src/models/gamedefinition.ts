import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

enum Games {
    PokemonBattlegrounds = 'PokemonBattlegrounds'
}

interface IGameDefinition {
    id: string;
    name: string;
    type: Games;
    createdDate: Date;
}

interface GameDefinitionModelInterface extends mongoose.Model<GameDefinitionDoc> {
    build(attr: IGameDefinition): GameDefinitionDoc;
}

interface GameDefinitionDoc extends mongoose.Document {
    id: string;
    name: string;
    type: Games;
    createdDate: Date;
}

const gameDefinitionSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: Games,
        required: true,
        unique: true
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});

gameDefinitionSchema.statics.build = (attr: IGameDefinition) => {
    return new GameDefinition(attr);
}

const GameDefinition = mongoose.model<GameDefinitionDoc, GameDefinitionModelInterface>('GameDefinition', gameDefinitionSchema);

export { GameDefinition, Games, IGameDefinition }