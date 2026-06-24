export interface StoredImage {
  readonly path: string;
  readonly thumbnailPath: string;
  readonly width: number;
  readonly height: number;
  readonly sizeBytes: number;
}

export interface ImageStoragePort {
  store(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<StoredImage>;
  delete(path: string): Promise<void>;
}
