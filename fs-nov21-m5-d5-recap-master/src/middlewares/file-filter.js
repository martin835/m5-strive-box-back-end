import { extname } from "path";
import createHttpError from "http-errors";
const allowedExtensions = [".jpg", ".png", ".pdf"];

export const fileFilter = (req, res, next) => {
  const extension = extname(req.file.originalname);
  if (
    allowedExtensions.some(
      (allowedExtension) => allowedExtension === extension.toLowerCase()
    )
  ) {
    next();
  } else {
    next(
      createHttpError(
        400,
        `${extension} is not allowed to upload try to upload one of ${allowedExtensions.join(
          ","
        )}`
      )
    );
  }
};
