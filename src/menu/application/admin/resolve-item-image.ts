import { IMAGE_SOURCE_TYPE, ImageSource } from "@/shared/domain";
import type { ImageStoragePort } from "@/shared/domain/ports";
import { MenuAdminError } from "./menu-admin-service";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function readUploadedFile(formData: FormData): File | null {
  const value = formData.get("image");
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  return value;
}

export async function resolveItemImageSource(
  formData: FormData,
  existing: ImageSource | undefined,
  storage: ImageStoragePort,
): Promise<ImageSource> {
  const removeImage = formData.get("removeImage") === "on";
  const uploaded = readUploadedFile(formData);

  if (uploaded) {
    if (!ALLOWED_IMAGE_TYPES.has(uploaded.type)) {
      throw new MenuAdminError("Formato de imagen no soportado (usa JPG, PNG o WebP)");
    }
    if (uploaded.size > MAX_IMAGE_BYTES) {
      throw new MenuAdminError("La imagen no puede superar 5 MB");
    }

    if (existing?.type === IMAGE_SOURCE_TYPE.LOCAL) {
      await storage.delete(existing.url).catch(() => undefined);
    }

    const buffer = Buffer.from(await uploaded.arrayBuffer());
    const stored = await storage.store(buffer, uploaded.name, uploaded.type);
    return ImageSource.local(stored.path);
  }

  if (removeImage) {
    if (existing?.type === IMAGE_SOURCE_TYPE.LOCAL) {
      await storage.delete(existing.url).catch(() => undefined);
    }
    return ImageSource.placeholder();
  }

  return existing ?? ImageSource.placeholder();
}
