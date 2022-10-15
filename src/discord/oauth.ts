import { Request, Response } from "express";
import Config from "../Config";
import FirebaseManager from "../db/FirebaseManager";
import { GetUserRequest } from "./DiscordAPI";
import { resolve as r } from "path";
import Template from "../template";

interface OAuthResponse {
    token_type: "Bearer"; // Always Bearer
    access_token: string;
    expires_in: number; // 604800
    scope: string; // "email identify"
}

export default async function handle(req: Request, res: Response) {
    const query = req.query as unknown as OAuthResponse;
    if (!query.access_token) {
        // No params - Replace # with ? and redirect
        res.send(`
            <script>
                const hash = window.location.hash;
                if(hash.length > 0) {
                    window.location.replace(window.location.href.replace('#','?'));
                }
            </script>
      `);
        return;
    }

    const userReq = new GetUserRequest();
    const discordUser = (await userReq.get(query.access_token)).data;
    const user = await FirebaseManager.Instance.findUser(discordUser.email, true, { displayName: discordUser.username });
    let token: string;
    if (user && user.uid) token = await FirebaseManager.Instance.generateToken(user.uid);
    else return res.status(500).send("Error generating token");

    // Authenticated - Send to client
    const template = new Template(r(__dirname, "./onAuthenticated.js"), {
        FIREBASE_CONFIG: JSON.stringify(Config.FIREBASE_PUBLIC_CONFIG),
        TOKEN: token
    });

    res.send(`<script type="module">${template.render()}</script>`);
}