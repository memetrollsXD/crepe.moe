/**
 * @class Logger
 * @description Logs to the console and writes to log files
 * @param logName What are you logging?
 */
import color from 'colorts';
import 'colorts/lib/string';
import fs from 'fs';
import { resolve } from 'path';

const r = (...args: string[]) => resolve(__dirname, ...args);

function writeLog(logName: string, message: string) {
    try {
        if (!fs.existsSync(r(`../logs/${logName}.log`))) fs.writeFileSync(r(`../logs/${logName}.log`), '');
        fs.appendFileSync(r(`../logs/${logName}.log`), `${message}\n`);
    } catch (e: any) {
        console.log(e);
    }
}

export default class Logger {
    constructor(public readonly logName: string) {

    }

    public raw(evt: any, data: any) {
        const msg = `[${new Date().toLocaleString()}] \t ${evt} \t ${data}`;
        console.log(msg);
    };

    public log(data: string) {
        this.raw(color(this.logName).yellow, color(data).green);
        writeLog(this.logName, `[${new Date().toLocaleString()}] ${data}`);
    };

    private getDate(): string {
        return new Date().toLocaleString();
    }

    public error(e: Error) {
        console.log(`[${this.getDate().white.bold}] ${`ERROR<${this.logName}>`.bgRed.bold}`, e.message);
        if (e.stack) this.trail(e.stack);
        writeLog(this.logName, `[${this.getDate()}] ${JSON.stringify(e)}`);
    }

    public trail(...args: string[]) {
        console.log(`\t↳ ${args.join(' ').gray}`);
    }

    public warn(...args: any) {
        console.log(`[${this.getDate().white.bold}] ${'WARN'.bgYellow.bold}`, ...args);
    }

    public debug(...args: any) {
        console.log(`[${this.getDate().white.bold}] ${`DEBUG<${this.logName}>`.bgBlue.bold}`, ...args);
    }
}
