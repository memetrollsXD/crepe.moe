import { Request, Response } from "express";
import FirebaseManager from "./db/FirebaseManager";
import Upload from "./db/Upload";
import { getUploadByUID } from "./util";

enum ActionType {
    Delete = 0,
    Edit = 1,
    DMCA = 2
}

interface AdminReq {
    type?: ActionType,
    token?: string,
    id?: string
    data?: any
}

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
    const verified = await FirebaseManager.Instance.verifyToken(body.token, entry.ownerUid);
    if (!verified) return res.status(401).send("Invalid token");

    // Use + to convert to number
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
                succ: false,
                msg: "No title provided"
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
        case ActionType.DMCA:
            // TODO: Unhandled - DMCA takedown
            res.status(501).send({
                success: false,
                message: "Not implemented yet"
            });
            break;
    }
}