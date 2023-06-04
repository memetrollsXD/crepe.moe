export default class Ratelimit {
    static #instance: Ratelimit;
    private uploadMap: Map<string, number> = new Map<string, number>(); // <ip, uploadCount>

    private constructor() {
        setInterval(() => {
            this.uploadMap.clear();
        }, 3_600_000); // 1 hour
    }

    public static get Instance(): Ratelimit {
        return this.#instance ??= new Ratelimit();
    }

    public getUploadCount(ip: string): number {
        return this.uploadMap.get(ip) ?? 0;
    }

    public addUploadCount(ip: string): void {
        const count = this.uploadMap.get(ip) ?? 0;
        this.uploadMap.set(ip, count + 1);
    }

    public isLimited(ip: string): boolean {
        return (this.uploadMap.get(ip) ?? 0) > 10;
    }
}