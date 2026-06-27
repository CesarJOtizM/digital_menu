"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface LandingHeroCarouselProps {
  readonly images: readonly string[];
  readonly alt: string;
}

/**
 * Crossfading hero slides — mirrors the multi-image hero on azaharpr.com.
 */
export function LandingHeroCarousel({ images, alt }: LandingHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className={cn(
            "-z-10 object-cover transition-opacity duration-1000 ease-in-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {images.length > 1 ? (
        <div
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2"
          aria-hidden="true"
        >
          {images.map((src, index) => (
            <span
              key={src}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                index === activeIndex ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
