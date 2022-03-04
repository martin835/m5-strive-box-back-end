import { Router } from "express";
import multer from "multer";
import { fileFilter } from "../../middlewares/file-filter.js";
import createHttpError from "http-errors";
import { PUBLIC_FOLDER_PATH, saveFile } from "../../utils/fs-utils.js";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import fs from "fs-extra";

import { body, validationResult } from "express-validator";

const DATA_FOLDER_PATH = dirname(fileURLToPath(import.meta.url));

const FILES_JSON_PATH = join(DATA_FOLDER_PATH, "files.json");

const getFileObjects = () => fs.readJSON(FILES_JSON_PATH);

const saveFileObject = async (fileObject) => {
  try {
    const fileObjects = await getFileObjects();
    fileObjects.push(fileObject);
    await fs.writeJSON(FILES_JSON_PATH, fileObjects);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const filesRouter = Router();

filesRouter.get("/", async (req, res, next) => {
  try {
    const files = await getFileObjects();
    res.send(files);
  } catch (error) {
    next(createHttpError(500, error.message));
  }
});

filesRouter.post(
  "/",
  multer().single("file"),
  fileFilter,
  async (req, res, next) => {
    try {
      const { url, fileName } = await saveFile(req.file, true);
      const ip = await publicIp.v4();
      const fileObject = {
        id: uuid(),
        originalName: req.file.originalname,
        url,
        fileName,
        createdAt: new Date().toString(),
        updatedAt: new Date().toString(),
      };
      await saveFileObject(fileObject);
      res.status(201).send(fileObject);
    } catch (error) {
      next(createHttpError(500, "File is not uploaded"));
    }
  }
);

filesRouter.get("/:fileName", async (req, res, next) => {
  try {
    const filePath = join(PUBLIC_FOLDER_PATH, req.params.fileName);
    const exists = await fs.pathExists(filePath);
    if (exists) {
      res.download(filePath);
    } else {
      next(createHttpError(404, `${req.params.fileName} is not found`));
    }
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Cant download file."));
  }
});

filesRouter.delete("/:fileId", async (req, res, next) => {
  try {
    let fileObjects = await getFileObjects();
    const fileObject = fileObjects.find(
      (fileObject) => fileObject.id === req.params.fileId
    );
    if (fileObject) {
      fileObjects = fileObjects.filter(
        (fileObject) => fileObject.id !== req.params.fileId
      );
      await fs.writeJSON(FILES_JSON_PATH, fileObjects);
      await fs.unlink(join(PUBLIC_FOLDER_PATH, fileObject.fileName));
      res.status(204).send();
    } else {
      next(createHttpError(404, `${req.params.fileId} is not found`));
    }
  } catch (error) {
    next(createHttpError(500, error.message));
  }
});

filesRouter.put(
  "/:fileId",
  body("originalName")
    .exists()
    .isString()
    .withMessage("originalName is required"),

  async (req, res, next) => {
    try {
      const validation = validationResult(req);
      if (validation.isEmpty()) {
        let fileObjects = await getFileObjects();
        const fileObjectIndex = fileObjects.findIndex(
          (fileObject) => fileObject.id === req.params.fileId
        );
        if (fileObjectIndex !== -1) {
          fileObjects[fileObjectIndex] = {
            ...fileObjects[fileObjectIndex],
            ...req.body,
            updatedAt: new Date().toString(),
          };
          await fs.writeJSON(FILES_JSON_PATH, fileObjects);
          res.send(fileObjects[fileObjectIndex]);
        } else {
          next(createHttpError(404, "not found!"));
        }
      } else {
        next(createHttpError(400, { errors: validation.errors }));
      }
    } catch (error) {
      next(createHttpError(500, error.message));
    }
  }
);

export default filesRouter;
