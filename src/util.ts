import fs from 'fs';

interface UploadDB {
    root: UploadI[]
}

interface UploadI {
    uid: string;
    ext: string;
    file: FileI;
    timestamp: number;
    ip: string;
}

interface FileI {
    name: string;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
}

async function getUploads() {
    return await JSON.parse(fs.readFileSync('./src/uploads.json', 'utf8'));
}

export async function getUploadByUID(uid: string): Promise<UploadI> {
    const uploads = await getUploads();
    // console.log(uploads.root.find((upload: UploadI) => upload.uid === uid));
    return uploads.root.find((upload: UploadI) => upload.uid === uid);
}