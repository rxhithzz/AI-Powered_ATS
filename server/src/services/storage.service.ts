import fs from "fs";
import path from "path";
import { env } from "../lib/env";

export interface StoredFileResult {
  fileUrl: string;
  fileName: string;
  size: number;
}

export interface StorageService {
  uploadFile(file: Express.Multer.File, subfolder?: string): Promise<StoredFileResult>;
  deleteFile?(fileUrl: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, subfolder?: string): Promise<StoredFileResult> {
    const targetDir = subfolder ? path.join(this.uploadDir, subfolder) : this.uploadDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = path.join(targetDir, uniqueFileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const relativeUrl = subfolder
      ? `/uploads/${subfolder}/${uniqueFileName}`
      : `/uploads/${uniqueFileName}`;

    return {
      fileUrl: relativeUrl,
      fileName: file.originalname,
      size: file.size,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.replace(/^\/uploads\//, "");
    const fullPath = path.join(this.uploadDir, relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

/**
 * CloudinaryStorageService stub for future cloud migration
 */
export class CloudinaryStorageService implements StorageService {
  async uploadFile(file: Express.Multer.File, subfolder?: string): Promise<StoredFileResult> {
    throw new Error(
      "CloudinaryStorageService is not configured yet. Set CLOUDINARY_URL and install Cloudinary SDK."
    );
  }

  async deleteFile(fileUrl: string): Promise<void> {
    throw new Error("CloudinaryStorageService.deleteFile is not implemented.");
  }
}

// Default storage singleton using LocalStorage
export const storageService: StorageService = new LocalStorageService();

