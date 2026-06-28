import { ImageSource } from "@/shared/domain";
import type { StoredImage } from "@/shared/domain/ports";

export function imageSourceFromStored(stored: StoredImage): ImageSource {
  return stored.path.startsWith("http")
    ? ImageSource.external(stored.path)
    : ImageSource.local(stored.path);
}
