/**
 * @file template.ts
 * @description I had a skill issue w/ template engines, so I wrote this
 */
type stringObject = { [key: string]: string };
import fs from 'fs';
import { resolve as r } from 'path';
import Config from './Config';
import { toSize } from './util';

export default class Template {
    public readonly fields: stringObject;
    public constructor(public readonly file: string, fields?: stringObject) {
        this.fields = {
            STATIC_MAX_FILE_SIZE: toSize(Config.MAX_FILE_MB * 1000000),
            STATIC_MAX_PREMIUM_FILE_SIZE: toSize(Config.MAX_PREMIUM_FILE_MB * 1000000),
            STATIC_SLOGAN: Config.SLOGAN,
            STATIC_DOMAIN_NAME: Config.DOMAIN_NAME,
            STATIC_MAX_FILE_MB: Config.MAX_FILE_MB.toString(),
            STATIC_MAX_PREMIUM_FILE_MB: Config.MAX_PREMIUM_FILE_MB.toString(),
            STATIC_DISCORD_CLIENT_ID: Config.DISCORD_CLIENT_ID,
            STATIC_FIREBASE_CONFIG: JSON.stringify(Config.FIREBASE_PUBLIC_CONFIG),
            ...fields
        };
        this.fields["STATIC_ANNOUNCE_BANNER"] = Config.ANNOUNCE_BANNER ? `<div class="ann-header">${Config.ANNOUNCE_BANNER}</div>` : ``;
        if (!this.file.includes("footer.html")) this.fields["STATIC_FOOTER"] = new Template(r(__dirname, "./frontend/templates/footer.html")).render();
    }
    public render(): string {
        let template = fs.readFileSync(this.file, 'utf8');
        for (let key in this.fields) {
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), this.fields[key]);
        }
        return template;
    }
}