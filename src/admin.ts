import { Request, Response } from "express";
import { ActionType, AdminReq, PremiumLevel } from "./frontend/public/SharedTypes";
import AuthManager from "./auth/AuthManager";
import Upload from "./db/Upload";
import { getUploadByUID } from "./util";
import Config from "./Config";

export default async function run(req: Request, res: Response) {
    const body = <AdminReq>req.body;
    const type = Number(body.type);

    // Sanity checks
    if (!body.id) return res.status(400).send("No ID provided");
    if (!body.token) return res.status(400).send("No token provided");
    if (isNaN(type)) return res.status(400).send("No action provided");
    const entry = await getUploadByUID(body.id);
    if (!entry) return res.status(404).send("No entry found");
    if (!entry.ownerUid) return res.status(400).send("Upload has no owner");

    // Authentication
    const dToken = await AuthManager.Instance.decryptToken(body.token);
    const verified = dToken && dToken.uid === entry.ownerUid;
    if (!verified) return res.status(401).send("Invalid token");

    switch (type) {
        case ActionType.Delete:
            entry.del().then(() => {
                res.status(200).send({
                    success: true,
                    message: "Entry deleted"
                });
            });
            break;
        case ActionType.Edit:
            // Edit name
            if (!body.data.title) return res.status(400).send({
                success: false,
                message: "No title provided"
            });

            Upload.findOneAndUpdate({ uploadId: body.id }, {
                $set: {
                    "file.name": body.data.title
                }
            }).then(() => {
                res.status(200).send({
                    success: true,
                    message: "Entry title modified successfully"
                });
            });
            break;
        case ActionType.ChangeID:
            //! Keep this updated. It won't hijack an URL, but it will prevent the user from losing its upload.

            // Change upload ID
            if ((dToken?.premiumLevel || 0) < PremiumLevel.PREMIUM) return res.status(403).send({
                success: false,
                message: "Not premium: cannot change ID"
            });
            let newId = body.data.newId;
            newId = newId.replace(/[^a-zA-Z0-9_-]/g, "_");
            if (!newId) return res.status(400).send({
                success: false,
                message: "No new ID provided"
            });

            if (Config.DISALLOWED_IDS.includes(newId)) return res.status(400).send({
                success: false,
                message: "New ID is not allowed"
            });

            entry.updateOne({
                $set: {
                    uploadId: newId
                }
            }).then(() => {
                res.status(200).send({
                    success: true,
                    message: "Changed upload id"
                });
            });
            break;
        case ActionType.DMCA:
            // TODO: Unhandled - DMCA takedown
            res.status(501).send({
                success: false,
                message: "Not implemented yet"
            });
            break;
    }
}