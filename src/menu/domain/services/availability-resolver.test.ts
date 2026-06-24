import { describe, it, expect } from "vitest";
import { AvailabilityResolver } from "./availability-resolver";
import { AvailabilityWindow } from "../value-objects/availability-window";

describe("AvailabilityResolver", () => {
  const resolver = new AvailabilityResolver();

  describe("no window means always available", () => {
    it("is available when the window is undefined", () => {
      const now = new Date("2024-06-12T03:00:00Z");
      expect(resolver.isAvailable(undefined, now, "America/New_York")).toBe(true);
    });
  });

  describe("timezone-aware weekday + minute derivation", () => {
    // 2024-06-12 is a Wednesday. 13:00 UTC = 09:00 in America/New_York (EDT, -4).
    const window = AvailabilityWindow.create({
      days: [3], // Wednesday
      startMinute: 540, // 09:00
      endMinute: 1020, // 17:00
    });

    it("is available inside the window in the configured timezone", () => {
      const now = new Date("2024-06-12T14:00:00Z"); // 10:00 local
      expect(resolver.isAvailable(window, now, "America/New_York")).toBe(true);
    });

    it("is unavailable before the window opens in the configured timezone", () => {
      const now = new Date("2024-06-12T12:00:00Z"); // 08:00 local
      expect(resolver.isAvailable(window, now, "America/New_York")).toBe(false);
    });

    it("uses the LOCAL weekday, not the UTC weekday", () => {
      // 2024-06-13T01:00:00Z is Thursday UTC but still Wednesday 21:00 local.
      const lateWindow = AvailabilityWindow.create({
        days: [3], // Wednesday
        startMinute: 1200, // 20:00
        endMinute: 1380, // 23:00
      });
      const now = new Date("2024-06-13T01:00:00Z"); // Wed 21:00 local
      expect(resolver.isAvailable(lateWindow, now, "America/New_York")).toBe(true);
    });
  });

  describe("window edges", () => {
    const window = AvailabilityWindow.create({
      days: [3],
      startMinute: 540, // 09:00
      endMinute: 1020, // 17:00
    });

    it("is available exactly at the inclusive start (09:00:00 local)", () => {
      const now = new Date("2024-06-12T13:00:00Z"); // 09:00 local
      expect(resolver.isAvailable(window, now, "America/New_York")).toBe(true);
    });

    it("is unavailable exactly at the exclusive end (17:00:00 local)", () => {
      const now = new Date("2024-06-12T21:00:00Z"); // 17:00 local
      expect(resolver.isAvailable(window, now, "America/New_York")).toBe(false);
    });
  });

  describe("DST spring-forward (America/New_York, 2024-03-10 02:00->03:00)", () => {
    // A window 03:00-04:00 local on that Sunday (day 0).
    const window = AvailabilityWindow.create({
      days: [0], // Sunday
      startMinute: 180, // 03:00
      endMinute: 240, // 04:00
    });

    it("matches wall-clock 03:30 AFTER the skipped hour (EDT, -4)", () => {
      // 07:30 UTC = 03:30 EDT after spring-forward.
      const now = new Date("2024-03-10T07:30:00Z");
      expect(resolver.isAvailable(window, now, "America/New_York")).toBe(true);
    });

    it("does NOT misfire one hour early due to naive offset math (EST window)", () => {
      // 06:30 UTC = 01:30 EST (still before the gap) -> not in a 03:00-04:00 window.
      const now = new Date("2024-03-10T06:30:00Z");
      expect(resolver.isAvailable(window, now, "America/New_York")).toBe(false);
    });

    it("respects a different timezone for the same UTC instant", () => {
      // 07:30 UTC in Europe/Madrid (CET, +1) = 08:30 local -> not in 03:00-04:00.
      const now = new Date("2024-03-10T07:30:00Z");
      expect(resolver.isAvailable(window, now, "Europe/Madrid")).toBe(false);
    });
  });
});
