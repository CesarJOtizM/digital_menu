import type { ImageStoragePort } from "@/shared/domain/ports";
import { SupabaseImageStorage } from "./supabase-image-storage";

export function createImageStorage(): ImageStoragePort {
  return new SupabaseImageStorage();
}
