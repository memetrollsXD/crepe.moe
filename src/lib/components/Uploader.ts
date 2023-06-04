interface Chunk {
    start: number;
    end: number;
    progress: number;
}

export default class Uploader {
    public static readonly chunkSize = (1024 ** 2) * 10; // 10MB
    public static readonly threads = 4;
    public uploadID = "";
    public chunks = new Array<Chunk>();
    public activeConnections = {};

    public constructor(public readonly file: File) {
        // Split file into chunks
        for (let i = 0; i < this.file.size; i += Uploader.chunkSize) {
            this.chunks.push({
                start: i,
                end: Math.min(i + Uploader.chunkSize, this.file.size),
                progress: 0
            });
        }
    }

    public async upload() {
        // Send upload request
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload");
        xhr.setRequestHeader("X-Content-Name", this.file.name);
        xhr.setRequestHeader("X-Content-Length", this.file.size.toString());
        xhr.setRequestHeader("X-Chunks-Amount", this.chunks.length.toString());
        xhr.send();
        
        xhr.onload = () => {
            this.uploadID = xhr.responseText;
        };
        // Upload chunks
        const promises = this.chunks.map((chunk) => this.uploadChunk(chunk));
        await Promise.all(promises);
    }

    private async uploadChunk(chunk: Chunk) {
        // Upload chunk
        const blob = this.file.slice(chunk.start, chunk.end);
        const formData = new FormData();
        formData.append("file", blob);
        // Upload via XHR to /upload
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload");
        xhr.setRequestHeader("X-Content-Name", this.file.name);
        xhr.setRequestHeader("X-Content-Length", this.file.size.toString());
        xhr.setRequestHeader("X-Chunks-Amount", this.chunks.length.toString());
    }
}