import { getUpload } from "../../server/storage.js";
import { lookup as mimeLookup } from "mime-types";

export const handler = async (event) => {
  const path = event.path || "";
  const match = path.match(/\/uploads\/(.+)$/);
  if (!match) return { statusCode: 404, body: "Not found" };

  const key = decodeURIComponent(match[1]);
  const file = await getUpload(key);
  if (!file) return { statusCode: 404, body: "Not found" };

  const contentType = file.contentType || mimeLookup(key) || "application/octet-stream";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body: file.buffer.toString("base64"),
    isBase64Encoded: true,
  };
};
