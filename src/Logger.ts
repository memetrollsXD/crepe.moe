/**
 * @class Logger
 * @description Logs to the console and writes to log files
 * @param logName What are you logging?
 */
import color from 'colorts';
import 'colorts/lib/string';
import fs from 'fs';

function writeLog(logName: string, message: string) {
    try {
        if (!fs.existsSync(`./src/logs/${logName}.log`)) fs.writeFileSync(`./src/logs/${logName}.log`, '');
        fs.appendFileSync(`./src/logs/${logName}.log`, `${message}\n`);
    } catch (e: any) {
        console.log(e);
    }
}

export default class Logger {
    log: Function;
    raw: Function;
    logName: string;
    constructor(logName: string) {
        this.logName = logName;
        this.raw = (evt: string, data: string) => {
            const msg = `[${new Date().toLocaleString()}] \t ${evt} \t ${data}`;
            console.log(msg);
        };
        this.log = (data: string) => {
            this.raw(color(logName).yellow, color(data).green);
            writeLog(this.logName, `[${new Date().toLocaleString()}] ${data}`);
        };
    }

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
