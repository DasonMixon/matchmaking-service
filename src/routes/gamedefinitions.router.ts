import express from "express";
import { GameDefinition, IGameDefinition } from "./../models/gamedefinition";
import { body } from 'express-validator';
import validateRequest from './../middleware/validateRequest';

export const gameDefinitionsRouter = express.Router();

gameDefinitionsRouter.get('/', async (req, res) => {
    const gameDefinitions = await GameDefinition.find({});
    return res.status(200).send(gameDefinitions);
});

gameDefinitionsRouter.post('/create',
    body('name').isString().isLength({ min: 1 }),
    body('type').isString().isLength({ min: 1 }),
    validateRequest,
    async (req, res) => {
        try {
            const model: IGameDefinition = req.body;
            const gameDefinition = GameDefinition.build(model);
            await gameDefinition.validate();
            await gameDefinition.save();
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