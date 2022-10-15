import { Request, Response } from "express";
import Config from "../Config";
import FirebaseManager from "../db/FirebaseManager";
import { GetUserRequest } from "./DiscordAPI";

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
    let token;
    if (user && user.uid) token = await FirebaseManager.Instance.generateToken(user.uid);
    else return res.status(500).send("Error generating token");

    // Authenticated - Send to client
    res.send(`
        <script type="module">
            import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';
        
            import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js';

            const firebaseConfig = ${JSON.stringify(Config.FIREBASE_PUBLIC_CONFIG)}; // Valid JSON
            
            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);

            // Sign in with custom token
            signInWithCustomToken(auth, "${token}").then(() => {
                window.location.href = "/auth";
            });
        </script>
    `);
}