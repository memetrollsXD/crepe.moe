/**
 * @class Content
 * @description Uploaded content handler for crepe.moe
 */
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import { resolve } from "path";
import Upload from "../db/Upload";
import User from "../db/User";
import { PremiumLevel } from "../frontend/public/SharedTypes";

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

interface AuthData {
    uid?: string;
    token?: string;
    isPremium?: boolean;
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
    uploadId: string;
    ownerUid?: string;
}

export default class Content {
    constructor(public readonly file: UploadedFile, public readonly auth: AuthData) { }

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

            const upload = new Upload({
                uploadId: saveAs.split('.').shift() || "",
                saveAs: {
                    name: saveAs,
                    ext: saveAs.split('.').pop() || ""
                },
                ip,
                file: stripped,
                ownerUid: this.auth.uid,
                isPremium: this.auth.isPremium
            })

            await upload.save();

            return upload.toObject();
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