/**
 * @file upload.ts
 * @description Upload handler for crepe.moe
 */
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import Logger from './Logger';
import Content, { SavedContent } from './display/Content';
import Config from './Config';
import { UploadRsp } from './frontend/public/SharedTypes';
const c = new Logger("Upload");

export default async function run(req: Request, res: Response) {
    try {
        console.debug(req.body);
        console.debug(req.files);
        if (!req.files) {
            res.status(400).send('No file uploaded');
            return;
        }

        // If the file size exceeds 512MB, reject it
        const file = req.files.file as UploadedFile;
        if (file.size > Config.MAX_FILE_MB * 1024 ** 2) {
            res.status(400).send('File is too large');
            return;
        }

        new Content(file, req.body).save(req.ip).then((saved: SavedContent) => {
            c.log(`${saved._id} uploaded by ${req.ip}`);
            res.send(<UploadRsp>{
                success: true,
                message: "OK",
                timestamp: Date.now(),
                data: {
                    url: {
                        full: `https://${Config.DOMAIN_NAME}/${saved._id}/${saved.file.name}`,
                        short: `https://${Config.DOMAIN_NAME}/${saved._id}`,
                        cdn: `https://${Config.DOMAIN_NAME}/c/${saved._id}`,
                        id: saved.uploadId
                    },
                    meta: saved.file,
                    ownerUid: saved.ownerUid
                },
            });
        });
    } catch (e) {
        c.error(e as unknown as Error);
        res.status(500).send(`An error has occured. Please contact info@${Config.DOMAIN_NAME}`);
    }
}