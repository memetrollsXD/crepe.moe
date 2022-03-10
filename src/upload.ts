/**
 * @file upload.ts
 * @description Upload handler for crepe.moe
 */
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import Logger from './Logger';
import Content from './Content';
import { SavedContent } from './Content';

const c = new Logger("Upload");

export default async function run(req: Request, res: Response) {
    if (!req.files) {
        res.status(400).send('No file uploaded');
        return;
    }
    const file = req.files.file as UploadedFile;
    
    // If the file size exceeds 100MB, reject it
    if (file.size > 100 * 1024 * 1024) {
        res.status(400).send('File is too large');
        return;
    }
    new Content(file).save(req.ip.split(':')[3]).then((fileName: SavedContent) => {
        c.log(`.${fileName.ext} file uploaded by ${req.ip.split(':')[3]}`);
        res.send(fileName.saveAs);
    });
}