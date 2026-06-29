"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface CategoryNavItem {
  readonly id: string;
  readonly name: string;
}

interface CategoryNavProps {
  readonly categories: readonly CategoryNavItem[];
  readonly ariaLabel: string;
}

/** Matches scroll-mt-28 on category headings (~112px sticky offset). */
const STICKY_OFFSET_PX = 112;

function categorySectionId(categoryId: string): string {
  return `category-${categoryId}`;
}

function resolveActiveCategoryId(
  categories: readonly CategoryNavItem[],
): string | null {
  let activeId = categories[0]?.id ?? null;

  for (const category of categories) {
    const heading = document.getElementById(categorySectionId(category.id));
    if (!heading) {
      continue;
    }

    if (heading.getBoundingClientRect().top <= STICKY_OFFSET_PX) {
      activeId = category.id;
      continue;
    }

    break;
  }

  return activeId;
}

/**
 * Sticky category pills with horizontal scroll (including mouse-wheel on desktop)
 * and scroll-spy highlighting for the section currently in view.
 */
export function CategoryNav({ categories, ariaLabel }: CategoryNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null);

  useEffect(() => {
    let frame = 0;

    const syncActiveCategory = () => {
      const nextActiveId = resolveActiveCategoryId(categories);
      if (nextActiveId) {
        setActiveId((current) => (current === nextActiveId ? current : nextActiveId));
      }
    };

    const scheduleSync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActiveCategory);
    };

    scheduleSync();

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
    };
  }, [categories]);

  useEffect(() => {
    const nav = navRef.current;
    if (!activeId || !nav) {
      return;
    }

    const activeLink = nav.querySelector<HTMLAnchorElement>(
      `a[href="#${categorySectionId(activeId)}"]`,
    );

    if (!activeLink) {
      return;
    }

    const linkLeft = activeLink.offsetLeft;
    const linkWidth = activeLink.offsetWidth;
    const scrollTarget = linkLeft - (nav.clientWidth - linkWidth) / 2;

    if (typeof nav.scrollTo === "function") {
      nav.scrollTo({ left: scrollTarget, behavior: "smooth" });
    } else {
      nav.scrollLeft = scrollTarget;
    }
  }, [activeId]);

  const handleWheel = useCallback((event: WheelEvent) => {
    const nav = navRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) {
      return;
    }

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      nav.scrollLeft += event.deltaY;
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) {
      return;
    }

    nav.addEventListener("wheel", handleWheel, { passive: false });
    return () => nav.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className="menu-category-nav overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max min-w-full justify-center gap-2 px-1">
        {categories.map((category) => {
          const isActive = category.id === activeId;

          return (
            <a
              key={category.id}
              href={`#${categorySectionId(category.id)}`}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "menu-category-pill shrink-0 text-xs uppercase tracking-wide",
                isActive ? "menu-category-pill--active" : "menu-category-pill--inactive",
              )}
            >
              {category.name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export { resolveActiveCategoryId, STICKY_OFFSET_PX };
