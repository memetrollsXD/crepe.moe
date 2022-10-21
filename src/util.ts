import fs from 'fs';
import http from 'http';
import { resolve } from 'path';
import Upload from './db/Upload';

export function r(...args: string[]) {
    return fs.readFileSync(resolve(__dirname, ...args)).toString();
}

export async function getUploadByUID(uid: string) {
    const record = await Upload.findOne({ uploadId: uid });
    return record;
}

export function toSize(bytes: number) {
    if (bytes == 0) return '0 B';
    const k = 1024,
        dm = 2,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(parseFloat((bytes / Math.pow(k, i)).toFixed(dm))) + ' ' + sizes[i];
}

export function getRandomFact(callback: (fact: string) => any) {
    const randomTypes = ['trivia', 'math', 'year', 'date'];
    const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];

    http.request(`http://numbersapi.com/random/${randomType}?notfound=2503+is+a+cool+number.`, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => {
            chunks.push(chunk);
        });

        res.on('end', () => {
            callback(Buffer.concat(chunks).toString());
        });
    }).end();
}

export function generateRandomString(length: number) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}