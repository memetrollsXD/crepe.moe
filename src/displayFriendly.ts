/**
 * @file displayFriendly.ts
 * @description crepe.moe/* for file rendering
 */
import { Request, Response } from 'express';
import Logger from './Logger';
import Template from './template';
import { getUploadByUID } from './util';
import fs from 'fs';
const c = new Logger("CDN");

export default async function displayFriendly(req: Request, res: Response) {
    const content = req.path.slice(1);
    if (!content) {
        res.status(301).redirect('https://crepe.moe');
        return;
    }
    const upload = await getUploadByUID(content);
    if (!upload) {
        res.status(301).redirect('https://crepe.moe');
        return;
    }
    const filePath = `/var/www/crepemoe/src/uploads/${upload.uid}.${upload.ext}`;
    if (!fs.existsSync(filePath)) {
        res.status(301).redirect('https://crepe.moe');
        return;
    }

    let previewType: string = "";
    switch (true) {
        case /^image\//.test(upload.file.mimetype):
            previewType = `<img src="https://crepe.moe/c/${upload.uid}" alt="${upload.file.name}" />`;
        break;
        case /^video\//.test(upload.file.mimetype):
            previewType = `<video src="https://crepe.moe/c/${upload.uid}" controls />`;
        break;
        case /^audio\//.test(upload.file.mimetype):
            previewType = `<audio src="https://crepe.moe/c/${upload.uid}" controls />`;
        break;
        default:
            previewType = `<span id="file-upload-btn" class="btn btn-primary" onclick="window.location.href='https://crepe.moe/c/${upload.uid}.${upload.ext}'">Download</span>`;
    }

    const page = new Template('./src/templates/view/index.html', {
        cdn: `https://crepe.moe/c/${upload.uid}`,
        title: upload.file.name,
        preview: previewType,
        timestamp: new Date(upload.timestamp).toLocaleString(),
    });

    c.log(`${req.originalUrl.split('?')[0]} requested by ${req.ip.split(':')[3]}`);
    res.send(page.render());
}