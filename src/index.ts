/**
 * crepe.moe
 * A file sharing website
 */
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import { resolve } from 'path';
import upload from './upload';
import displayAPI from './display/displayAPI';
import displayFriendly from './display/displayFriendly';

const app = express();
app.use(fileUpload());

app.post('/upload', (req, res) => upload(req, res));

app.get('/c/:content', (req, res) => displayAPI(req, res));
app.get('/:content/:full', (req, res) => res.redirect(`/${req.params.content}`));
app.get('/*', (req, res) => displayFriendly(req, res));
app.listen(8008, () => { console.log(`Listening on port 8008`) });

// Check if uploads/logs folder exists

const checkExists = (name: string) => (!fs.existsSync(resolve(__dirname, `../${name}`))) ? fs.mkdirSync(resolve(__dirname, `../${name}`)) : void 0;

checkExists('uploads');
checkExists('logs');