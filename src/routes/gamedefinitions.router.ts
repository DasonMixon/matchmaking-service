import express from "express";
import { GameDefinition, Games, IGameDefinition } from "./../models/gamedefinition";

export const gameDefinitionsRouter = express.Router();

gameDefinitionsRouter.get('/', async (req, res) => {
    const gameDefinitions = await GameDefinition.find({});
    return res.status(200).send(gameDefinitions);
});

gameDefinitionsRouter.post('/create', async (req, res) => {
    try {
        const model: IGameDefinition = req.body;
        const gameDefinition = GameDefinition.build(model);
        await gameDefinition.validate();
        await gameDefinition.save();

        // TODO: Figure out how to get enum to store / serialize proeprly
        if (gameDefinition.type === Games.PokemonBattlegrounds)
            console.log('evals just fine');

        return res.status(200).send(gameDefinition);
    } catch (err) {
        console.log(err);
        return res.status(500).send({error: err});
    }
});

/*

    await GameDefinition.findOneAndUpdate({ 'type': model.type }, gameDefinition, { upsert: true }, (err, doc) => {
        if (err)
            return res.status(500).send({error: err});
        return res.status(200).send(doc);
    });
*/