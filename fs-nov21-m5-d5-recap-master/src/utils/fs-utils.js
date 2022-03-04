import { join, extname } from "path";

import { v4 as uuid } from "uuid";

import fs from "fs-extra";

export const PUBLIC_FOLDER_PATH = join(process.cwd(), "public");

export const saveFile = async (file, uniqueName = false) => {
  try {
    // create fileName if uniqueName is true generate id else use originalname
    const fileName = uniqueName
      ? `${uuid()}${extname(file.originalname)}`
      : file.originalname;
    // join fileName and public folder path --> this is where file is saved
    const filePath = join(PUBLIC_FOLDER_PATH, fileName);

    await fs.writeFile(filePath, file.buffer);
    // return accessible browser url
    const url = `http://localhost:5001/${fileName}`;
    return { url, fileName };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
