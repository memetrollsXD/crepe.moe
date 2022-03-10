/**
 * crepe.moe
 * A file sharing website
 */
import express from 'express';
import fileUpload from 'express-fileupload';
import upload from './upload';
import displayAPI from './displayAPI';
import displayFriendly from './displayFriendly';

const app = express();
app.use(express.static('src/public'));
app.use(fileUpload());

app.post('/upload', (req, res) => upload(req, res));

app.get('/c/:content', (req, res) => displayAPI(req, res));
app.get('/*', (req, res) => displayFriendly(req, res));
app.listen(8008, () => { console.log(`Listening on port 8008`) });