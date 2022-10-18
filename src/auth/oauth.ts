import { Request, Response } from "express";
import { GetUserRequest } from "../discord/DiscordAPI";
import { resolve } from "path";
import Template from "../template";
import User from "../db/User";
import AuthManager from "./AuthManager";

const r = (templateName: string) => resolve(__dirname, `../frontend/templates/${templateName}.js`);

interface OAuthResponse {
    token_type: "Bearer"; // Always Bearer
    access_token: string;
    expires_in: number; // 604800
    scope: string; // "email identify"
}

export default async function handle(req: Request, res: Response) {
    const query = req.body as unknown as OAuthResponse;
    if (!query.access_token) {
        // No params - Send via POST
        const template = new Template(r("redirectPost"));
        res.send(`<script>${template.render()}</script>`);
        return;
    }

    const userReq = new GetUserRequest();
    const discordUser = (await userReq.get(query.access_token)).data;
    const user = await User.findUser(discordUser.id, true, { displayName: discordUser.username, email: discordUser.email, isAnonymous: false });
    if (!user) return res.status(500).send("Failed to create user");
    const token = await AuthManager.Instance.generateToken(user);

    // Authenticated - Send to client
    const template = new Template(r("onAuthenticated"), { token });
    res.send(`<script type="module">${template.render()}</script>`);
}