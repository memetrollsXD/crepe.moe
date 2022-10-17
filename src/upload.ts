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
import User from './db/User';
import AuthManager from './auth/AuthManager';
const c = new Logger("Upload");

export default async function run(req: Request, res: Response) {
    try {
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

        const tmpUser = new User({
            discordId: 0,
            displayName: "Anonymous",
            createdAt: new Date(),
            updatedAt: new Date(),
            discordToken: ""
        });
        if (!req.body.token) {
            tmpUser.save();
        }

        new Content(file, req.body).save(req.ip).then(async (saved: SavedContent) => {
            c.log(`${saved.uploadId} uploaded by ${req.ip}`);
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
                newAccountToken: req.body.token ? undefined : await AuthManager.Instance.generateToken(tmpUser)
            });
        });
    } catch (e) {
        c.error(e as unknown as Error);
        res.status(500).send(`An error has occured. Please contact info@${Config.DOMAIN_NAME}`);
    }
}