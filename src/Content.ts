/**
 * @class Content
 * @description Uploaded content handler for crepe.moe
 */
import { UploadedFile } from "express-fileupload";
import fs from "fs";

interface SavedFile {
    name: string;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
}

export interface SavedContent {
    saveAs: string;
    ext: string;
    ip: string;
    file: SavedFile;
    timestamp: number;
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
        if (fs.existsSync(`./src/uploads/${saveAs}`)) {
            this.save(ip);
            return {
                saveAs: '',
                ext: '',
                ip: '',
                timestamp: 0,
                file: { name: '', size: 0, encoding: '', tempFilePath: '', truncated: false, mimetype: '', md5: '' }
            }
        } else {
            await fs.writeFileSync(`./src/uploads/${saveAs}`, this.file.data);
            const raw = await fs.readFileSync(`./src/uploads.json`, 'utf8');
            const uploads = JSON.parse(raw);
            const stripped: any = this.file;
            delete stripped.data;
            delete stripped.mv;
            uploads.root.push({
                uid: saveAs.split('.')[0] as string,
                timestamp: Date.now(),
                ext: saveAs.split('.')[1] as string,
                ip: ip,
                file: stripped as SavedFile
            });
            await fs.writeFileSync(`./src/uploads.json`, JSON.stringify(uploads, null, 2));
            return {
                saveAs: saveAs as string,
                timestamp: Date.now(),
                ext: saveAs.split('.')[1] as string,
                ip: ip,
                file: stripped as SavedFile
            };
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