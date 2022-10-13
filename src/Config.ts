import fs from 'fs';
import { resolve } from 'path';
import { r } from './util';

const DEFAULT_CONFIG = {
    // MongoDB
    MONGO_URI: "mongodb://localhost:27017/crepemoe",

    // HTTP,
    HTTP_HOST: "0.0.0.0",
    HTTP_PORT: 8008,
    
    // Upload
    MAX_FILE_MB: 512,
    DOMAIN_NAME: "crepe.moe",
    SLOGAN: "Free temporary file hosting for everyone!"
}
type DefaultConfig = typeof DEFAULT_CONFIG;

function readConfig(): any {
    let config: DefaultConfig;
    try {
        config = JSON.parse(r('../config.json'));
        // Check if config object.keys is the same as DEFAULT_CONFIG.keys
        const missing = Object.keys(DEFAULT_CONFIG).filter(key => !config.hasOwnProperty(key));

        if (missing.length > 0) {
            missing.forEach(key => {
                // @ts-ignore
                config[key] = DEFAULT_CONFIG[key];
            });
            updateConfig(config);
            console.log(`Added missing config keys: ${missing.join(', ')}`);
        }
    } catch {
        console.error("Could not read config file. Creating one for you...");
        config = DEFAULT_CONFIG;
        updateConfig(config);
    }
    return config;
}

function updateConfig(config: any) {
    fs.writeFileSync(resolve(__dirname, '../config.json'), JSON.stringify(config, null, 2));
}

export default class Config {
    public static config = readConfig();
    public static MONGO_URI = Config.config.MONGO_URI;
    public static MAX_FILE_MB = Config.config.MAX_FILE_MB;
    public static DOMAIN_NAME = Config.config.DOMAIN_NAME;
    public static SLOGAN = Config.config.SLOGAN;
    public static HTTP_HOST: string = Config.config.HTTP_HOST;
    public static HTTP_PORT: number = Config.config.HTTP_PORT;

    private constructor() { }
}