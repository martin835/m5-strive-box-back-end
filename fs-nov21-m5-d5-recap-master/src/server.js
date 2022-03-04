import express from "express";

import { PUBLIC_FOLDER_PATH } from "./utils/fs-utils.js";
import { errorHandler } from "./errorHandler.js";
import filesRouter from "./service/files/route.js";

const PORT = 5001;

const server = express();

// public folder is accessible to anyone under '/'
server.use(express.static(PUBLIC_FOLDER_PATH));

// data exchange language will be json --> means -> parse the body as json

server.use(express.json());

server.use("/files", filesRouter);

server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

server.on("error", (error) => {
  console.log(`❌ Server is crushed : ${error}`);
});
