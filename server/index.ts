/* eslint-disable unicorn/no-process-exit */
import fs from "fs";
import https from "https";
import express, { Request, Response } from "express";
import next from "next";

// const config = require("../config");

const stage = process.env.APP_ENV;
const assetPrefix = process.env.ASSET_PREFIX;
// const host = config.server.hostUrl;
// const port = config.server.port;

const host = "0.0.0.0";
const port = "3000";

if (process.env.APP_ENV === undefined) {
  console.warn("No APP_ENV found. Have you properly set up an .env file?");
}

// const isDevMode = stage === "local";
const isDevMode = true;
// const app = next({ dir: "./src", dev: isDevMode });
const app = next({ dev: isDevMode });

// const handler = routes.getRequestHandler(app);
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get(`${assetPrefix}/healthz`, (_req: Request, res: Response) =>
    res.status(200).send("ok")
  );

  // server.use(function (req, res, next) {
  //   req.url = req.originalUrl.replace(`${assetPrefix}/`, "/");
  //   next(); // be sure to let the next middleware handle the modified request.
  // });

  // server.use(`${assetPrefix}`, redirect(app));
  server.get("*", (_req: Request, res: Response) => {
    return handler(_req, res);
  });

  // server.use(helmet());

  var options = {
    key: fs.readFileSync("./server/security/key.pem"),
    cert: fs.readFileSync("./server/security/cert.pem"),
  };

  // @ts-ignore
  https.createServer(options, server).listen(port, host, (err) => {
    if (err) throw err;

    console.log(`[MAIN SERVER] APP_ENV: ${stage}`);
    console.log(`[MAIN SERVER] Ready on http://${host}:${port}`);
    // logger.info(`[MAIN SERVER] APP_ENV: ${stage}`)
    // logger.info(`[MAIN SERVER] Ready on PORT: ${port}`)
  });
});

// logger.debug('SERVER SIDE CONFIG', config)
process.on("unhandledRejection", (error) => {
  // logger.error('unhandledRejection', error)
  console.log("unhandledRejection", error);
  process.exit(1);
});
