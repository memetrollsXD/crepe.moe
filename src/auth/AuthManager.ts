import { SignJWT, jwtVerify } from "jose";
import jwtDecode from "jwt-decode";
import Config from "../Config";
import User from "../db/User";
import { CrepeToken } from "../frontend/public/SharedTypes";

type AsyncReturnType<T extends (...args: any) => any> =
    T extends (...args: any) => Promise<infer U> ? U :
    T extends (...args: any) => infer U ? U :
    any

export default class AuthManager {
    private static _instance: AuthManager;
    private readonly key: Uint8Array;

    private constructor() {
        this.key = new Uint8Array((<string>Config.JWT_SECRET).split("").map(c => c.charCodeAt(0)));
    }

    public static get Instance(): AuthManager {
        if (!this._instance) this._instance = new AuthManager();
        return this._instance;
    }

    public async generateToken(user: AsyncReturnType<typeof User.findUser>, expirationSeconds = 2629743) { // Old expirationSeconds: 604800 | New: about a month
        if (!user) throw new Error("User is null");
        const payload = {
            uid: user._id,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous,
            premiumLevel: user.premiumLevel
        };

        const jwt = new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(`${expirationSeconds}s`)
            .setIssuer(Config.DOMAIN_NAME)
            .setAudience(Config.DOMAIN_NAME)
            .sign(this.key);

        return await jwt;
    }

    /**
     * @method verifyToken
     * @param token The token to verify
     * @param uid The uid that corresponds to the token
     * @returns True if the token is valid, false otherwise
     */
    public async verifyToken(token: string, uid: string) {
        try {
            const { payload } = await jwtVerify(token, this.key);

            return payload.uid === uid.toString();
        } catch (e) {
            return false;
        }
    }

    public async decryptToken(token: string): Promise<CrepeToken | null> {
        let result = null;
        try {
            result = await jwtDecode(token);
        } catch (e) {
            result = null;
        } finally {
            return result;
        }
    }
}