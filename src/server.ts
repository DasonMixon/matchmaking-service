import express from 'express';
import { gameDefinitionsRouter } from './routes/gamedefinitions.router';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Define the express server routes
app.use(express.json());
app.use('/gamedefinitions', gameDefinitionsRouter);
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Connect to mongo
mongoose.connect(process.env.CONNECTION_STRING, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, () => {
     console.log('Connected to database');
});

// Start the express server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});