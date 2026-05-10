import serverless from "serverless-http";
import { createApp } from "../../server/app.js";

const app = createApp();

const wrapped = serverless(app, {
  binary: ["image/*", "video/*", "application/octet-stream", "multipart/form-data"],
  request: (req, event) => {
    // Netlify redirects /api/* -> /.netlify/functions/api/:splat
    // event.path is the rewritten path; strip the function prefix so Express sees /api/...
    const prefix = "/.netlify/functions/api";
    if (req.url && req.url.startsWith(prefix)) {
      req.url = "/api" + req.url.slice(prefix.length);
    }
  },
});

export const handler = wrapped;
