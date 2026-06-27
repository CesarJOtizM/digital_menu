import { describe, expect, it } from "vitest";
import { buildLandingViewModel } from "./landing-view-model";

const BRANDING = {
  restaurantName: "Azahar Modern Tasca",
  logo: "https://cdn.example.com/azahar.png",
} as const;

describe("buildLandingViewModel", () => {
  describe("hero", () => {
    it("uses headline, description, image slides and hero CTA", () => {
      const vm = buildLandingViewModel(BRANDING, {
        hero: {
          images: [
            "/uploads/landing/hero-1.svg",
            "/uploads/landing/hero-2.svg",
          ],
          headline: "Modern Tapas, Sunset Views",
          description: "Lagoon-side dining in Condado.",
          cta: { label: "View Menu", href: "/menu" },
        },
      });

      expect(vm.hero.restaurantName).toBe("Azahar Modern Tasca");
      expect(vm.hero.headline).toBe("Modern Tapas, Sunset Views");
      expect(vm.hero.description).toBe("Lagoon-side dining in Condado.");
      expect(vm.hero.imageUrls).toEqual([
        "/uploads/landing/hero-1.svg",
        "/uploads/landing/hero-2.svg",
      ]);
      expect(vm.hero.cta).toEqual({ label: "View Menu", href: "/menu" });
    });

    it("falls back to tagline as headline for legacy blobs", () => {
      const vm = buildLandingViewModel(BRANDING, {
        hero: { tagline: "Cocina de azahar y brasa" },
      });

      expect(vm.hero.headline).toBe("Cocina de azahar y brasa");
      expect(vm.hero.imageUrls).toEqual([]);
    });

    it("falls back to restaurant name when hero copy is absent", () => {
      const vm = buildLandingViewModel(BRANDING, {});

      expect(vm.hero.headline).toBe("Azahar Modern Tasca");
      expect(vm.hero.imageUrls).toEqual([]);
    });
  });

  describe("highlights", () => {
    it("maps feature blocks with images and optional CTAs", () => {
      const vm = buildLandingViewModel(BRANDING, {
        highlights: [
          {
            heading: "Spanish Tapas, Local Flavor",
            body: "Plates to share.",
            image: "/uploads/landing/feature-tapas.svg",
            cta: { label: "View Menu", href: "/menu" },
          },
        ],
      });

      expect(vm.highlights).toEqual([
        {
          heading: "Spanish Tapas, Local Flavor",
          body: "Plates to share.",
          imageUrl: "/uploads/landing/feature-tapas.svg",
          imageAlt: null,
          cta: { label: "View Menu", href: "/menu" },
        },
      ]);
    });
  });

  describe("contact", () => {
    it("exposes phone and email when configured", () => {
      const vm = buildLandingViewModel(BRANDING, {
        contact: {
          heading: "Contact",
          phone: "(787) 482-8182",
          email: "info@azaharpr.com",
        },
      });

      expect(vm.contact).toEqual({
        heading: "Contact",
        phone: "(787) 482-8182",
        email: "info@azaharpr.com",
      });
    });

    it("is null when no contact details survive parsing", () => {
      const vm = buildLandingViewModel(BRANDING, { contact: {} });

      expect(vm.contact).toBeNull();
    });
  });

  describe("private dining", () => {
    it("maps the callout section", () => {
      const vm = buildLandingViewModel(BRANDING, {
        privateDining: {
          heading: "Private Dining & Celebrations",
          body: "Host with us.",
          image: "/uploads/landing/feature-private.svg",
          cta: {
            label: "Reserve a Table",
            href: "https://wa.me/17874828182?text=private",
          },
        },
      });

      expect(vm.privateDining).toEqual({
        heading: "Private Dining & Celebrations",
        body: "Host with us.",
        imageUrl: "/uploads/landing/feature-private.svg",
        imageAlt: null,
        cta: {
          label: "Reserve a Table",
          href: "https://wa.me/17874828182?text=private",
        },
      });
    });
  });

  describe("location section", () => {
    it("builds an embed URL from the address and keeps the external map link", () => {
      const vm = buildLandingViewModel(BRANDING, {
        location: {
          heading: "Location",
          address: "886 Ashford Ave, San Juan, PR",
          mapUrl: "https://maps.google.com/?q=Azahar+Condado",
        },
      });

      expect(vm.location?.mapEmbedUrl).toContain("output=embed");
      expect(vm.location?.mapEmbedUrl).toContain("Azahar");
      expect(vm.location?.mapUrl).toBe("https://maps.google.com/?q=Azahar+Condado");
    });
  });

  describe("view-menu CTA", () => {
    it("defaults the CTA label and href to /menu", () => {
      const vm = buildLandingViewModel(BRANDING, {});

      expect(vm.cta).toEqual({ label: "Ver carta", href: "/menu" });
    });
  });
});
