import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (e) => {
    return json({ msg: "Not implemented" })
};