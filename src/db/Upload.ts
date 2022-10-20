import { modelOptions, prop, getModelForClass, DocumentType } from "@typegoose/typegoose";
import fs from "fs";
import { resolve as r} from "path";

interface TakedownInfo {
    status: boolean;
    reason: string;
}

interface SavedFile {
    name: string;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
}

interface SaveAs {
    name: string;
    ext: string;
}

@modelOptions({ schemaOptions: { collection: "uploads" } })
class Upload {
    @prop({ required: true })
    public uploadId!: string;

    @prop()
    public ownerUid?: string;

    @prop({
        default: {
            status: false,
            reason: `This request may not be serviced in the Roman Province
    of Judea due to the Lex Julia Majestatis, which disallows
    access to resources hosted on servers deemed to be
    operated by the People's Front of Judea.`
        },
        allowMixed: 0
    })
    public takedown?: TakedownInfo;

    @prop({ default: 0 })
    public views?: number;

    @prop({ default: Date.now() })
    public timestamp?: number;

    @prop({ required: true })
    public ip!: string;

    @prop({ required: true, allowMixed: 0 })
    public file!: SavedFile;

    @prop({ required: true, allowMixed: 0 })
    public saveAs!: SaveAs;

    @prop({ default: false })
    public isPremium?: boolean;

    //! Use del instead of delete
    public async del(this: DocumentType<Upload>) {
        fs.unlinkSync(r(__dirname, `../../uploads/${this.saveAs.name}`));
        return await this.delete();
    }
}

export default getModelForClass(Upload);