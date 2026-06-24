import * as path from "node:path";
import * as fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type {
  ImageStoragePort,
  StoredImage,
} from "@/shared/domain/ports";

const MIME_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function mimeToExt(mimeType: string): string {
  return MIME_MAP[mimeType] ?? "jpg";
}

export class LocalImageStorage implements ImageStoragePort {
  private readonly uploadDir = path.join(
    process.cwd(),
    "public/uploads/items",
  );

  async store(
    buffer: Buffer,
    _filename: string,
    mimeType: string,
  ): Promise<StoredImage> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = mimeToExt(mimeType);
    const id = randomUUID();
    const mainName = `${id}.${ext}`;
    const thumbName = `${id}-thumb.${ext}`;

    const mainImage = sharp(buffer).resize(800, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
    const thumbImage = sharp(buffer).resize(400, 400, { fit: "cover" });

    const [mainMeta] = await Promise.all([
      mainImage.toFile(path.join(this.uploadDir, mainName)),
      thumbImage.toFile(path.join(this.uploadDir, thumbName)),
    ]);

    return {
      path: `/uploads/items/${mainName}`,
      thumbnailPath: `/uploads/items/${thumbName}`,
      width: mainMeta.width,
      height: mainMeta.height,
      sizeBytes: mainMeta.size,
    };
  }

  async delete(filePath: string): Promise<void> {
    const abs = path.join(process.cwd(), "public", filePath);
    await fs.unlink(abs).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") throw err;
    });

    const thumbPath = filePath.replace(/\.(\w+)$/, "-thumb.$1");
    const absThumb = path.join(process.cwd(), "public", thumbPath);
    await fs.unlink(absThumb).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") throw err;
    });
  }
}
