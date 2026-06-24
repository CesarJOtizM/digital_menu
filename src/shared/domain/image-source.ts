const IMAGE_SOURCE_TYPE = {
  LOCAL: "local",
  EXTERNAL: "external",
  PLACEHOLDER: "placeholder",
} as const;

type ImageSourceType =
  (typeof IMAGE_SOURCE_TYPE)[keyof typeof IMAGE_SOURCE_TYPE];

export class ImageSource {
  private constructor(
    private readonly _type: ImageSourceType,
    private readonly _url: string,
  ) {}

  static local(path: string): ImageSource {
    return new ImageSource(IMAGE_SOURCE_TYPE.LOCAL, path);
  }

  static external(url: string): ImageSource {
    return new ImageSource(IMAGE_SOURCE_TYPE.EXTERNAL, url);
  }

  static placeholder(): ImageSource {
    return new ImageSource(IMAGE_SOURCE_TYPE.PLACEHOLDER, "/placeholder.svg");
  }

  static resolve(
    imagePath: string | null | undefined,
    imageUrl: string | null | undefined,
  ): ImageSource {
    if (imagePath) {
      return ImageSource.local(imagePath);
    }
    if (imageUrl) {
      return ImageSource.external(imageUrl);
    }
    return ImageSource.placeholder();
  }

  get type(): ImageSourceType {
    return this._type;
  }

  get url(): string {
    return this._url;
  }

  equals(other: ImageSource): boolean {
    return this._type === other._type && this._url === other._url;
  }
}

export { IMAGE_SOURCE_TYPE };
export type { ImageSourceType };
