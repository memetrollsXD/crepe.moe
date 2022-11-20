/**
 * @file displayAPI.ts
 * @description Handlse when a user visits a crepe content link
 */
import { Request, Response } from 'express';
import fs from 'fs';
import { resolve } from 'path';
import Config from '../Config';
import Upload from '../db/Upload';
import Logger from '../Logger';
import { getUploadByUID } from '../util';
const c = new Logger("API");

export default async function displayAPI(req: Request, res: Response) {
    try {
        const content = req.params.content.split('.')[0];
        if (!content) {
            res.status(400).send('No content specified');
            return;
        }
        const upload = await getUploadByUID(content);
        if (!upload) {
            res.status(404).send('Content not found');
            return;
        }
        const filePath = resolve(__dirname, `../../uploads/${upload.saveAs.name}`);
        if (!fs.existsSync(filePath)) {
            res.status(404).send('Content not found!');
            return;
        }
        const ip = req.headers['x-real-ip'] ?? req.ip;
        c.log(`${req.originalUrl.split('?')[0]} requested by ${ip}`);

        // Update view count
        await Upload.findOneAndUpdate({ uploadId: upload.uploadId }, {
            $inc: {
                views: 1
            }
        });

        // Check if file is blacklisted
        if (upload.takedown!.status) {
            res.status(451).send(upload.takedown!.reason || "Content is unavailable");
            return;
        }

        let fileName = upload.file.name;
        // Add file extension
        if (!fileName.endsWith(`.${upload.saveAs.ext}`)) fileName += `.${upload.saveAs.ext}`;

        await res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.sendFile(filePath);
    } catch (e) {
        c.error(e as unknown as Error);
        res.status(500).send(`An error has occured. Please contact info@${Config.DOMAIN_NAME}`);
    }
}
