import { describe, expect, it } from "vitest";
import { buildLandingViewModel } from "./landing-view-model";

/**
 * Pure projection of the per-deploy branding + the optional `landing` JSON blob
 * (persisted on the Settings singleton) into Azahar-style landing sections.
 *
 * The blob is `unknown` on purpose — it comes straight from a JSON column, so
 * the projection MUST parse defensively and degrade to branding-derived defaults
 * for anything missing. No I/O, no clock: everything is injected.
 */

const BRANDING = {
  restaurantName: "Azahar",
  logo: "https://cdn.example.com/azahar.png",
} as const;

describe("buildLandingViewModel", () => {
  describe("hero", () => {
    it("uses the configured hero image, tagline and the restaurant name", () => {
      const vm = buildLandingViewModel(BRANDING, {
        hero: {
          image: "https://cdn.example.com/hero.jpg",
          tagline: "Cocina de azahar y brasa",
        },
      });

      expect(vm.hero.restaurantName).toBe("Azahar");
      expect(vm.hero.imageUrl).toBe("https://cdn.example.com/hero.jpg");
      expect(vm.hero.tagline).toBe("Cocina de azahar y brasa");
      expect(vm.hero.logoUrl).toBe("https://cdn.example.com/azahar.png");
    });

    it("falls back to a null hero image and null tagline when absent", () => {
      const vm = buildLandingViewModel(BRANDING, {});

      expect(vm.hero.restaurantName).toBe("Azahar");
      expect(vm.hero.imageUrl).toBeNull();
      expect(vm.hero.tagline).toBeNull();
    });

    it("degrades gracefully when the blob is not an object at all", () => {
      const vm = buildLandingViewModel(BRANDING, null);

      expect(vm.hero.restaurantName).toBe("Azahar");
      expect(vm.hero.imageUrl).toBeNull();
      expect(vm.hero.tagline).toBeNull();
    });
  });

  describe("about section", () => {
    it("exposes the about heading and paragraphs when present", () => {
      const vm = buildLandingViewModel(BRANDING, {
        about: {
          heading: "Nuestra historia",
          body: ["Abrimos en 2019.", "Producto de mercado."],
        },
      });

      expect(vm.about).not.toBeNull();
      expect(vm.about?.heading).toBe("Nuestra historia");
      expect(vm.about?.paragraphs).toEqual([
        "Abrimos en 2019.",
        "Producto de mercado.",
      ]);
    });

    it("accepts a single string body and normalizes it to one paragraph", () => {
      const vm = buildLandingViewModel(BRANDING, {
        about: { body: "Solo un parrafo." },
      });

      expect(vm.about?.paragraphs).toEqual(["Solo un parrafo."]);
    });

    it("is null when no about content is configured", () => {
      const vm = buildLandingViewModel(BRANDING, { hero: {} });

      expect(vm.about).toBeNull();
    });
  });

  describe("hours section", () => {
    it("maps each day/hours pair in order", () => {
      const vm = buildLandingViewModel(BRANDING, {
        hours: {
          heading: "Horarios",
          schedule: [
            { day: "Mar–Jue", hours: "13–23" },
            { day: "Vie–Sab", hours: "13–00" },
          ],
        },
      });

      expect(vm.hours?.heading).toBe("Horarios");
      expect(vm.hours?.rows).toEqual([
        { day: "Mar–Jue", hours: "13–23" },
        { day: "Vie–Sab", hours: "13–00" },
      ]);
    });

    it("drops malformed schedule entries (missing day or hours)", () => {
      const vm = buildLandingViewModel(BRANDING, {
        hours: {
          schedule: [
            { day: "Lun", hours: "Cerrado" },
            { day: "Mar" },
            { hours: "13–23" },
            "garbage",
          ],
        },
      });

      expect(vm.hours?.rows).toEqual([{ day: "Lun", hours: "Cerrado" }]);
    });

    it("is null when no schedule rows survive parsing", () => {
      const vm = buildLandingViewModel(BRANDING, {
        hours: { schedule: ["x", { day: "Mar" }] },
      });

      expect(vm.hours).toBeNull();
    });
  });

  describe("location section", () => {
    it("exposes address, mapUrl and heading", () => {
      const vm = buildLandingViewModel(BRANDING, {
        location: {
          heading: "Donde estamos",
          address: "Av. Siempreviva 742",
          mapUrl: "https://maps.example.com/azahar",
        },
      });

      expect(vm.location?.heading).toBe("Donde estamos");
      expect(vm.location?.address).toBe("Av. Siempreviva 742");
      expect(vm.location?.mapUrl).toBe("https://maps.example.com/azahar");
    });

    it("keeps the address with a null mapUrl when no map link is set", () => {
      const vm = buildLandingViewModel(BRANDING, {
        location: { address: "Av. Siempreviva 742" },
      });

      expect(vm.location?.address).toBe("Av. Siempreviva 742");
      expect(vm.location?.mapUrl).toBeNull();
    });

    it("is null when there is no address", () => {
      const vm = buildLandingViewModel(BRANDING, {
        location: { mapUrl: "https://maps.example.com/x" },
      });

      expect(vm.location).toBeNull();
    });
  });

  describe("social links", () => {
    it("keeps only well-formed { label, url } entries, in order", () => {
      const vm = buildLandingViewModel(BRANDING, {
        social: [
          { label: "Instagram", url: "https://instagram.com/azahar" },
          { label: "No URL" },
          { url: "https://no-label.example.com" },
          { label: "WhatsApp", url: "https://wa.me/123" },
        ],
      });

      expect(vm.social).toEqual([
        { label: "Instagram", url: "https://instagram.com/azahar" },
        { label: "WhatsApp", url: "https://wa.me/123" },
      ]);
    });

    it("is an empty array when no social links are configured", () => {
      const vm = buildLandingViewModel(BRANDING, {});

      expect(vm.social).toEqual([]);
    });
  });

  describe("view-menu CTA", () => {
    it("uses the configured CTA label and always targets /menu", () => {
      const vm = buildLandingViewModel(BRANDING, {
        cta: { label: "Ver la carta" },
      });

      expect(vm.cta.label).toBe("Ver la carta");
      expect(vm.cta.href).toBe("/menu");
    });

    it("defaults the CTA label to 'View Menu' when not configured", () => {
      const vm = buildLandingViewModel(BRANDING, {});

      expect(vm.cta.label).toBe("View Menu");
      expect(vm.cta.href).toBe("/menu");
    });
  });
});
