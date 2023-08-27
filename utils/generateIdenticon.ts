import Identicon from "identicon.js";
import { createHash } from "crypto";

export const generateIdenticon = (input: string, size = 64) => {
    const hash: string = createHash("md5").update(input).digest("hex");
    const data: string = new Identicon(hash, size).toString();

    return `data:image/png:base64,${data}`;
};
