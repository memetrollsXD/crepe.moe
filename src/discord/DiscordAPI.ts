import axios from "axios";

abstract class BaseRequest {
    public abstract readonly path: string;
    public constructor(public data?: any) {

    }

    public get(token: string) {
        return axios.get(`https://discord.com/api/v10/${this.path}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
    }
}

export class GetUserRequest extends BaseRequest {
    public readonly path = 'users/@me';
}