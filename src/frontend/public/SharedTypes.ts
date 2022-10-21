export interface UploadRsp {
    success: boolean;
    message: string;
    timestamp: number;
    data: {
        url: {
            full: string;
            short: string;
            cdn: string;
            id: string;
        },
        meta: {
            name: string;
            size: number;
            encoding: string;
            tempFilePath: string;
            truncated: boolean;
            mimetype: string;
            md5: string;
        },
        ownerUid: string;
    },
    newAccountToken?: string;
}

export enum PremiumLevel {
    NONE = 0,
    PREMIUM = 1,
    ADMIN = 2
}

export interface CrepeToken {
    uid: string;
    displayName: string;
    isAnonymous: boolean;
    premiumLevel: PremiumLevel;
}

export interface AuthState {
    accessToken: string;
    displayName: string | null;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    phoneNumber: string | null;
    photoURL: string | null;
    uid: string;
}

export enum ActionType {
    Delete = 0,
    Edit = 1,
    DMCA = 2,
    ChangeID = 3
}

export interface AdminReq {
    type?: ActionType,
    token?: string,
    id?: string
    data?: any
}

export function getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function delCookie(name: string) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function setCookie(name: string, value: string, days: number = 365) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 ** 2 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}