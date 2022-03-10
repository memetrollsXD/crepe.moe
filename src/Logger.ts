/**
 * @class Logger
 * @description Logs to the console and writes to log files
 * @param logName What are you logging?
 */
import color from 'colorts';
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
    error: Function;
    warn: Function;
    raw: Function;
    debug: Function;
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
        this.error = (data: string) => {
            this.raw(color("ERROR").red, color(data).red);
        };
        this.warn = (data: string) => {
            this.raw(color("WARN").yellow, color(data).bgYellow.black.bold);
        };
        this.debug = (data: string) => {
            this.raw(color(logName).white.bgBlue, color(data).white.bgBlue);
        };
    }
}
