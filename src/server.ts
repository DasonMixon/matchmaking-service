import express from 'express';
import { gameDefinitionsRouter } from './routes/gamedefinitions.router';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use('/gamedefinitions', gameDefinitionsRouter);

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});