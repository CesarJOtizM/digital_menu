import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { ImageStoragePort, StoredImage } from "@/shared/domain/ports";
import { getSupabaseUrl } from "@/shared/infrastructure/supabase/env";

const MIME_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function mimeToExt(mimeType: string): string {
  return MIME_MAP[mimeType] ?? "jpg";
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for Supabase Storage");
  }
  return key;
}

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "menu-items";
}

function publicObjectUrl(bucket: string, objectKey: string): string {
  const base = getSupabaseUrl().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${objectKey}`;
}

function objectKeyFromReference(reference: string, bucket: string): string | null {
  const publicMarker = `/object/public/${bucket}/`;
  const publicIndex = reference.indexOf(publicMarker);
  if (publicIndex !== -1) {
    return reference.slice(publicIndex + publicMarker.length);
  }

  if (reference.startsWith("/uploads/")) {
    return null;
  }

  return reference.replace(/^\//, "");
}

export class SupabaseImageStorage implements ImageStoragePort {
  private readonly bucket = getBucketName();

  private adminClient() {
    return createClient(getSupabaseUrl(), getServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async store(
    buffer: Buffer,
    _filename: string,
    mimeType: string,
  ): Promise<StoredImage> {
    const ext = mimeToExt(mimeType);
    const id = randomUUID();
    const objectKey = `${id}.${ext}`;
    const thumbKey = `${id}-thumb.${ext}`;

    const [mainResult, thumbBuffer] = await Promise.all([
      sharp(buffer)
        .resize(800, null, { fit: "inside", withoutEnlargement: true })
        .toBuffer({ resolveWithObject: true }),
      sharp(buffer).resize(400, 400, { fit: "cover" }).toBuffer(),
    ]);

    const supabase = this.adminClient();
    const uploads = [
      supabase.storage.from(this.bucket).upload(objectKey, mainResult.data, {
        contentType: mimeType,
        upsert: false,
      }),
      supabase.storage.from(this.bucket).upload(thumbKey, thumbBuffer, {
        contentType: mimeType,
        upsert: false,
      }),
    ];

    const results = await Promise.all(uploads);
    for (const result of results) {
      if (result.error) {
        throw new Error(`Supabase upload failed: ${result.error.message}`);
      }
    }

    return {
      path: publicObjectUrl(this.bucket, objectKey),
      thumbnailPath: publicObjectUrl(this.bucket, thumbKey),
      width: mainResult.info.width,
      height: mainResult.info.height,
      sizeBytes: mainResult.info.size,
    };
  }

  async delete(reference: string): Promise<void> {
    const objectKey = objectKeyFromReference(reference, this.bucket);
    if (!objectKey) {
      return;
    }

    const supabase = this.adminClient();
    const thumbKey = objectKey.replace(/\.(\w+)$/, "-thumb.$1");

    await Promise.all([
      supabase.storage.from(this.bucket).remove([objectKey]),
      supabase.storage.from(this.bucket).remove([thumbKey]),
    ]);
  }
}
