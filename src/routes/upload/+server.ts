import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (e) => {
    const { file } = await e.request.json();
    const X_CONTENT_NAME = e.request.headers.get("X-Content-Name");
    const X_CONTENT_LEN = e.request.headers.get("X-Content-Length");
    const X_CHUNKS_AMOUNT = e.request.headers.get("X-Chunks-Amount");

    if (!X_CONTENT_NAME || !X_CONTENT_LEN || !X_CHUNKS_AMOUNT)
        return json({ msg: "Missing headers" }, { status: 400 });
    return json({ msg: "Not implemented" })
};