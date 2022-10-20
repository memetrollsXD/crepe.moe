import { Request, Response } from "express";
import AuthManager from "./auth/AuthManager";
import { PremiumLevel } from "./frontend/public/SharedTypes";
import { getUploadByUID } from "./util";

export default async function run(req: Request, res: Response) {
    const { curId, newId, token } = req.body;
    
    // Sanity checks

    if (!curId || !newId) return res.status(400).send({
        success: false,
        message: "No id(s) provided"
    });

    const upload = await getUploadByUID(curId);
    
    if (!upload) return res.status(404).send({
        success: false,
        message: "Upload not found",
    });

    const dToken = await AuthManager.Instance.decryptToken(token);
    
    if (dToken && dToken.uid !== upload.ownerUid) return res.status(401).send({
        success: false,
        message: "Invalid token"
    });

    if ((dToken?.premiumLevel || 0) < PremiumLevel.PREMIUM) return res.status(403).send({
        success: false,
        message: "Not premium: cannot change ID"
    });

    // Update logic

    upload?.updateOne({
        $set: {
            uploadId: newId
        }
    }).then(() => {
        res.send({
            success: true,
            message: "Changed upload id"
        })
    });
}