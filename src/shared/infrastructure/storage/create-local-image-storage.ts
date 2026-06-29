import type { ImageStoragePort } from "@/shared/domain/ports";
import { LocalImageStorage } from "./local-image-storage";

/** Dev-only factory when SUPABASE_SECRET_KEY is not set locally. */
export function createLocalImageStorage(): ImageStoragePort {
  return new LocalImageStorage();
}
