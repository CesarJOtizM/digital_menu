import Image from "next/image";
import { cn } from "@/lib/cn";

export type LandingImageAspect = "video" | "portrait" | "wide";

interface LandingImageProps {
  readonly src: string;
  readonly alt: string;
  readonly aspect?: LandingImageAspect;
  readonly className?: string;
  readonly priority?: boolean;
  readonly fill?: boolean;
}

const aspectClasses: Record<LandingImageAspect, string> = {
  video: "aspect-video",
  portrait: "aspect-[4/5]",
  wide: "aspect-[16/10]",
};

/**
 * Editorial landing image frame — rounded, object-cover, Azahar surface tones.
 */
export function LandingImage({
  src,
  alt,
  aspect = "video",
  className,
  priority = false,
  fill = false,
}: LandingImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 768px) 50vw, 100vw"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-stone-300/80 bg-stone-100 shadow-sm",
        aspectClasses[aspect],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 768px) 40vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
