/**
 * @class Content
 * @description Uploaded content handler for crepe.moe
 */
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import Database from "../db/Database";
import { resolve } from "path";

const r = (...args: string[]) => resolve(__dirname, ...args);

interface SavedFile {
    name: string;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
}

interface TakedownInfo {
    status: boolean;
    reason: string;
}

export interface SavedContent {
    _id: string;
    saveAs: {
        name: string;
        ext: string;
    };
    ip: string;
    file: SavedFile;
    timestamp: number;
    views: number;
    takedown: TakedownInfo;
}

export default class Content {
    file: UploadedFile;
    constructor(file: UploadedFile) {
        this.file = file;
    }

    /**
     * @method save
     * @description Saves the uploaded file to the filesystem
     */
    async save(ip: string): Promise<SavedContent> {
        const saveAs = `${randomName()}.${this.file.name.split('.').pop()}`;
        // Check if the file already exists
        if (fs.existsSync(r(`../../uploads/${saveAs}`))) {
            return this.save(ip);
        } else {
            fs.writeFileSync(r(`../../uploads/${saveAs}`), this.file.data);
            const stripped: any = this.file;
            delete stripped.data;
            delete stripped.mv;
            
            const rsp = {
                _id: saveAs.split('.').shift() || "",
                saveAs: {
                    name: saveAs,
                    ext: saveAs.split('.').pop() || "",
                },
                timestamp: Date.now(),
                ip: ip,
                file: stripped as SavedFile,
                views: 0,
                takedown: {
                    status: false,
                    reason: `This request may not be serviced in the Roman Province
                    of Judea due to the Lex Julia Majestatis, which disallows
                    access to resources hosted on servers deemed to be
                    operated by the People's Front of Judea.`,
                },
            };

            const db = Database.getInstance();
            await db.set("uploads", rsp);
            return rsp;
        }
    }
}
/**
 * @function randomName
 * @description Generates a short random string
 */
function randomName(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}