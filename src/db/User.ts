import { modelOptions, prop, getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { PremiumLevel } from "../frontend/public/SharedTypes";

@modelOptions({ schemaOptions: { collection: "users" } })
class User {
    @prop({ required: true })
    public discordId!: string;

    @prop({ required: true })
    public displayName!: string;

    @prop({ required: true })
    public createdAt!: Date;

    @prop({ required: true })
    public updatedAt!: Date;

    @prop({ required: true })
    public discordToken!: string;

    @prop({ required: true, allowMixed: 0 })
    public premiumLevel!: PremiumLevel;

    @prop({ required: true })
    public isAnonymous!: boolean;

    public static async findUser(this: ReturnModelType<typeof User>, discordId: string, autoCreate = false, acOptions?: { displayName?: string, discordToken: string, isAnonymous: boolean }) {
        const user = await this.findOne({ discordId });
        if (user) {
            user.updateOne({
                updatedAt: new Date(),
                discordToken: acOptions?.discordToken ?? user.discordToken,
                displayName: acOptions?.displayName ?? user.displayName,
                discordId: discordId 
            }, { upsert: true });
            return user;
        }

        if (!autoCreate) return null;

        return this.create({
            discordId,
            displayName: acOptions?.displayName || discordId,
            createdAt: new Date(),
            updatedAt: new Date(),
            discordToken: acOptions!.discordToken,
            premiumLevel: PremiumLevel.NONE
        });
    }
}

export default getModelForClass(User);