/**
 * @file upload.ts
 * @description Upload handler for crepe.moe
 */
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import Logger from './Logger';
import Content, { SavedContent } from './display/Content';
import Config from './Config';
import { PremiumLevel, UploadRsp } from './frontend/public/SharedTypes';
import User from './db/User';
import AuthManager from './auth/AuthManager';
import Ratelimit from './Ratelimit';
const c = new Logger("Upload");

export default async function run(req: Request, res: Response) {
    try {
        if (!req.files) {
            res.status(400).send('No file uploaded');
            return;
        }

        // Ratelimit
        const ip = <string>req.headers['x-real-ip'] ?? req.ip;
        if (Ratelimit.Instance.isLimited(ip)) {
            res.status(429).send('Too many requests');
            return;
        }
        Ratelimit.Instance.addUploadCount(ip);

        // Fetch owner
        const owner = await User.findOne({ _id: req.body.uid });
        const isPremium = (owner?.premiumLevel ?? 0) >= PremiumLevel.PREMIUM;

        // If the file size exceeds file limit, reject it
        const file = req.files.file as UploadedFile;
        if (isPremium) {
            if (file.size > Config.MAX_PREMIUM_FILE_MB * 1024 ** 2)
                return res.status(400)
                    .send('File is too large');
        } else {
            if (file.size > Config.MAX_FILE_MB * 1024 ** 2)
                return res.status(400)
                    .send('File is too large');
        }

        const tmpUser = new User({
            discordId: 0,
            displayName: "Anonymous",
            createdAt: new Date(),
            updatedAt: new Date(),
            email: "anonymous@crepe.moe",
            premiumLevel: PremiumLevel.NONE,
            isAnonymous: true
        });

        if (!req.body.uid) {
            tmpUser.save();
        }

        const authData = req.body.uid ? { ...req.body, isPremium } : { uid: tmpUser._id };

        new Content(file, authData).save(ip).then(async (saved: SavedContent) => {
            c.log(`${saved.uploadId} uploaded by ${ip}`);
            res.send(<UploadRsp>{
                success: true,
                message: "OK",
                timestamp: Date.now(),
                data: {
                    url: {
                        full: `https://${Config.DOMAIN_NAME}/${saved.uploadId}/${saved.file.name}`,
                        short: `https://${Config.DOMAIN_NAME}/${saved.uploadId}`,
                        cdn: `https://${Config.DOMAIN_NAME}/c/${saved.uploadId}`,
                        id: saved.uploadId
                    },
                    meta: saved.file,
                    ownerUid: saved.ownerUid
                },
                newAccountToken: req.body.uid ? undefined : await AuthManager.Instance.generateToken(tmpUser)
            });
        });
    } catch (e) {
        c.error(<Error>e);
        res.status(500).send(`An error has occured. Please contact info@${Config.DOMAIN_NAME}`);
    }
}