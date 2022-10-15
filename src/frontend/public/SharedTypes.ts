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
    }
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