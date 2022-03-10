/**
 * @file template.ts
 * @description I had a skill issue w/ template engines, so I wrote this
 */
type stringObject = { [key: string]: string };
import fs from 'fs';

export default class Template {
    file: string;
    fields: stringObject;
    constructor(file: string, fields: stringObject) {
        this.file = file;
        this.fields = fields;
    }
    render(): string {
        let template = fs.readFileSync(this.file, 'utf8');
        for (let key in this.fields) {
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), this.fields[key]);
        }
        return template;
    }
}