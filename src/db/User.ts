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
    public email!: string;

    @prop({ required: true, allowMixed: 0 })
    public premiumLevel!: PremiumLevel;

    @prop({ required: true })
    public isAnonymous!: boolean;

    public static async findUser(this: ReturnModelType<typeof User>, discordId: string, autoCreate = false, acOptions?: { displayName?: string, email: string, isAnonymous: boolean }) {
        const user = await this.findOne({ discordId });
        if (user) {
            user.updateOne({
                updatedAt: new Date(),
                email: acOptions?.email ?? user.email,
                displayName: acOptions?.displayName ?? user.displayName,
                discordId: discordId,
                isAnonymous: acOptions?.isAnonymous ?? user.isAnonymous
            }, { upsert: true });
            return user;
        }

        if (!autoCreate) return null;

        return this.create({
            discordId,
            displayName: acOptions?.displayName || discordId,
            createdAt: new Date(),
            updatedAt: new Date(),
            email: acOptions!.email,
            premiumLevel: PremiumLevel.NONE,
            isAnonymous: acOptions!.isAnonymous
        });
    }
}

export default getModelForClass(User);