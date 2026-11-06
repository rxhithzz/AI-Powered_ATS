import multer from "multer";
import { Request } from "express";
import { BadRequestError } from "../lib/errors";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfExt) {
    return cb(
      new BadRequestError("Invalid file type. Only PDF documents (.pdf) are allowed.")
    );
  }

  cb(null, true);
};

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

