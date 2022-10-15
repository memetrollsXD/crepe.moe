import fadmin, { initializeApp as AppI } from 'firebase-admin';
import Config from '../Config';
import Logger from '../Logger';
const c = new Logger("FirebaseManager");

export default class FirebaseManager {
    private static _instance: FirebaseManager;
    public app!: ReturnType<typeof AppI>;
    public started = false;

    private constructor() { }

    public static get Instance(): FirebaseManager {
        if (!this._instance) this._instance = new FirebaseManager();
        if (!this._instance.started) this._instance.init();
        return this._instance;
    }

    public init() {
        const s = Config.FIREBASE_SERVICE_ACCOUNT;
        if (!s.private_key) return c.error(new Error(`No valid Firebase Service account found. Please check your config.json file`));
        this.app = fadmin.initializeApp({
            credential: fadmin.credential.cert({
                clientEmail: s.client_email,
                privateKey: s.private_key.replace(/\\n/g, '\n'),
                projectId: s.project_id
            })
        });
        this.started = true;
    }

    public async findUser(email: string, autoCreate = false, autoCreateOptions?: { displayName?: string }) {
        let user: fadmin.auth.UserRecord | null = null;

        try {
            user = await this.app.auth().getUserByEmail(email);
        } catch (e) {
            if (autoCreate) {
                user = await this.app.auth().createUser({
                    email: email,
                    emailVerified: true,
                    displayName: autoCreateOptions?.displayName
                });
            }
        }

        return user || null;
    }

    public async generateToken(uid: string) {
        const token = await this.app.auth().createCustomToken(uid);
        return token;
    }

    public async verifyToken(token: string, uid: string) {
        let decoded;
        try {
            decoded = await this.app.auth().verifyIdToken(token)
        } catch (e) {
            return false;
        } finally {
            return decoded?.uid === uid || decoded?.admin === true;
        }
    }
}