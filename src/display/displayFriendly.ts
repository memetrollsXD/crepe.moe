/**
 * @file displayFriendly.ts
 * @description ${Config.DOMAIN_NAME}/* for file rendering
 */
import { Request, Response } from 'express';
import Logger from '../Logger';
import Template from '../template';
import { getRandomFact, getUploadByUID, toSize } from '../util';
import { resolve } from 'path';
import fs from 'fs';
import Config from '../Config';
const c = new Logger("CDN");

const r = (...args: string[]) => resolve(__dirname, ...args);

export default async function displayFriendly(req: Request, res: Response) {
    try {
        if (fs.existsSync(r(`../frontend/public${req.path}`))) return processStatic(req, res);
        
        const content = req.path.slice(1);
        if (!content) return await processStatic(req, res);

        const upload = await getUploadByUID(content);
        if (!upload) return await processStatic(req, res);

        const filePath = r(`../../uploads/${upload.saveAs.name}`);
        if (!fs.existsSync(filePath)) return await processStatic(req, res);

        let previewType: string = "";
        switch (true) {
            case /^image\//.test(upload.file.mimetype):
                previewType = `<img src="https://${Config.DOMAIN_NAME}/c/${upload.uploadId}" alt="${upload.file.name}" />`;
                break;
            case /^video\//.test(upload.file.mimetype):
                previewType = `<video src="https://${Config.DOMAIN_NAME}/c/${upload.uploadId}" controls></video>`;
                break;
            case /^audio\//.test(upload.file.mimetype):
                previewType = `<audio src="https://${Config.DOMAIN_NAME}/c/${upload.uploadId}" controls />`;
                break;
            default:
                previewType = `<span id="file-upload-btn" class="btn btn-primary" onclick="window.location.href='https://${Config.DOMAIN_NAME}/c/${upload.saveAs.name}'">Download</span>`;
        }

        const page = new Template(r(`../frontend/templates/view.html`), {
            cdn: `https://${Config.DOMAIN_NAME}/c/${upload.uploadId}`,
            title: upload.file.name,
            preview: previewType,
            timestamp: new Date(upload.timestamp!).toLocaleString(),
            views: upload.views!.toString(),
            ownerid: upload.ownerUid ?? "",
            isPremium: upload.isPremium ? `<b style="color: gold; user-select: none;"><i class="fa-solid fa-sparkles"></i> PREMIUM</b>` : "",
        });

        upload.takedown!.status ? res.status(451).send(new Template(r(`../frontend/templates/takedown.html`), { reason: upload.takedown!.reason }).render()) : res.send(page.render());
    } catch (e) {
        c.error(e as unknown as Error);
        res.status(500).send(`An error has occured. Please contact info@${Config.DOMAIN_NAME}`);
    }
}

async function processStatic(req: Request, res: Response) {
    let filePath = r(`../frontend/public${req.path}`);
    if (!fs.existsSync(filePath)) {
        getRandomFact(fact => {
            res.status(404).send(new Template(r(`../frontend/templates/404.html`), { fact }).render());
        });
        return;
    }
    if (fs.statSync(filePath).isDirectory()) filePath = r(`../frontend/public${req.path}/index.html`);

    const template = new Template(filePath).render();

    const scripts = [".js", ".ts"]
    scripts.forEach(s => {
        if (filePath.endsWith(s)) {
            res.type("text/javascript");
            return;
        } else {
            res.type("text/html");
        }
    });
    res.send(template);
}