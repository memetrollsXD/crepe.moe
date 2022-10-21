/**
 * crepe.moe
 * A file sharing website
 */
import express from 'express';
import { connect, connection } from 'mongoose';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { resolve } from 'path';
import upload from './upload';
import oauth from './auth/oauth';
import admin from './admin';
import linkAccount from './linkAccount';
import displayAPI from './display/displayAPI';
import displayFriendly from './display/displayFriendly';
import Config from './Config';

const app = express();
app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());

app.post('/upload', (req, res) => upload(req, res));
app.all('/oauth', (req, res) => oauth(req, res));
app.post('/admin', (req, res) => admin(req, res));
app.post('/linkAccount', (req, res) => linkAccount(req, res));

app.get('/c/:content', (req, res) => displayAPI(req, res));
app.get('/:content/:full', (req, res) => res.redirect(`/${req.params.content}`));
app.get('/*', (req, res) => displayFriendly(req, res));

// Connect to the database before starting the server
connect(Config.MONGO_URI).then(() => console.log("Connected to MongoDB")).catch(e => console.error(e));
connection.on("disconnected", () => connect(Config.MONGO_URI));

app.listen(Config.HTTP_PORT, Config.HTTP_HOST, () => { console.log(`Listening on port ${Config.HTTP_PORT}`) });

// Check if uploads/logs folder exists

const checkExists = (name: string) => (!fs.existsSync(resolve(__dirname, `../${name}`))) ? fs.mkdirSync(resolve(__dirname, `../${name}`)) : void 0;

checkExists('uploads');
checkExists('logs');

// Handles uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(error);
});

// Handles unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    if (reason instanceof Error) {
        console.error(reason);
    }
});