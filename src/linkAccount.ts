import { Request, Response } from "express";
import { CrepeToken } from "./frontend/public/SharedTypes";
import AuthManager from "./auth/AuthManager";
import User from "./db/User";

interface LinkAccountReq {
    oldToken?: string;
    newToken?: string;
}

export default async function run(req: Request, res: Response) {
    const body = <LinkAccountReq>req.body;

    if (!body.oldToken || !body.newToken) return res.status(400).json({ success: false, message: "Missing token(s)" });

    const oldToken = (await AuthManager.Instance.decryptToken(body.oldToken)) as unknown as CrepeToken;
    const newToken = (await AuthManager.Instance.decryptToken(body.newToken)) as unknown as CrepeToken;

    if (!oldToken || !newToken) return res.status(400).json({ success: false, message: "Invalid token(s)" });

    const oldUser = await User.findOne({ _id: oldToken.uid });
    const newUser = await User.findOne({ _id: newToken.uid });

    if (!oldUser || !newUser) return res.status(400).json({ success: false, message: "Unknown account(s)" });
    if (oldUser._id === newUser._id) return res.status(400).json({ success: false, message: "Cannot link to the same account" });

    const isOldTokenValid = await AuthManager.Instance.verifyToken(body.oldToken, oldUser._id);
    const isNewTokenValid = await AuthManager.Instance.verifyToken(body.newToken, newUser._id);

    if (!isOldTokenValid || !isNewTokenValid) return res.status(400).json({ success: false, message: "Invalid token signature(s)" });

    // Merge properties from new user to old user
    // This is generally stupid, but in this context we switch from an anonymous account to a normal one
    // We want to keep the old users uid because of past uploads
    oldUser.updateOne({
        $set: {
            discordId: newUser.discordId,
            displayName: newUser.displayName,
            updatedAt: new Date(),
            email: newUser.email,
            // Don't overwrite premium level
            isAnonymous: newUser.isAnonymous
        }
    }, { upsert: true }).then(() => {
        // Delete new user to keep the database clean
        newUser.deleteOne();
    });

    res.send({ success: true, message: body.oldToken });
}