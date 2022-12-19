import fs from 'fs';
import { resolve } from 'path';
import { generateRandomString, r } from './util';

const DEFAULT_CONFIG = {
    // MongoDB
    MONGO_URI: "mongodb://localhost:27017/crepemoe",

    // HTTP,
    HTTP_HOST: "0.0.0.0",
    HTTP_PORT: 8008,

    // Upload
    MAX_FILE_MB: 512,
    MAX_PREMIUM_FILE_MB: 1024,
    DOMAIN_NAME: "crepe.moe",
    SLOGAN: "Free temporary file hosting for everyone!",
    DISALLOWED_IDS: ["upload", "oauth", "admin", "linkAccount", "c", "auth", "fa", "privacy", ""],

    // Firebase
    FIREBASE_PUBLIC_CONFIG: {
        apiKey: "AIzaSyDoSUHACvuXdv5h7NAXcW3DB-tL4kpIElI",
        authDomain: "crepemoe.firebaseapp.com",
        projectId: "crepemoe",
        storageBucket: "crepemoe.appspot.com",
        messagingSenderId: "894429155894",
        appId: "1:894429155894:web:750822821515130abdbe97",
        measurementId: "G-PF95GTBX0N"
    },

    // Discord OAuth2 / JWT
    DISCORD_CLIENT_ID: "1030169566522908822",
    JWT_SECRET: generateRandomString(64),

    // General - Leave empty to disable
    ANNOUNCE_BANNER: "",
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
    public static MONGO_URI: string = Config.config.MONGO_URI;
    public static MAX_FILE_MB: number = Config.config.MAX_FILE_MB;
    public static MAX_PREMIUM_FILE_MB: number = Config.config.MAX_PREMIUM_FILE_MB;
    public static DOMAIN_NAME: string = Config.config.DOMAIN_NAME;
    public static SLOGAN: string = Config.config.SLOGAN;
    public static HTTP_HOST: string = Config.config.HTTP_HOST;
    public static HTTP_PORT: number = Config.config.HTTP_PORT;
    public static FIREBASE_PUBLIC_CONFIG: typeof DEFAULT_CONFIG.FIREBASE_PUBLIC_CONFIG = Config.config.FIREBASE_PUBLIC_CONFIG;
    public static DISCORD_CLIENT_ID: string = Config.config.DISCORD_CLIENT_ID;
    public static DISALLOWED_IDS: string[] = Config.config.DISALLOWED_IDS;
    public static ANNOUNCE_BANNER: string = Config.config.ANNOUNCE_BANNER;
    public static readonly JWT_SECRET: string = Config.config.JWT_SECRET;

    private constructor() { }
}