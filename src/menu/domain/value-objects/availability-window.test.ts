import { describe, it, expect } from "vitest";
import { AvailabilityWindow } from "./availability-window";
import { InvalidAvailabilityWindow } from "../errors";

describe("AvailabilityWindow", () => {
  describe("create", () => {
    it("builds a window from days plus start/end minute-of-day", () => {
      const window = AvailabilityWindow.create({
        days: [1, 2, 3, 4, 5],
        startMinute: 540, // 09:00
        endMinute: 1020, // 17:00
      });
      expect(window.days).toEqual([1, 2, 3, 4, 5]);
      expect(window.startMinute).toBe(540);
      expect(window.endMinute).toBe(1020);
    });

    it("rejects an empty day list", () => {
      expect(() =>
        AvailabilityWindow.create({ days: [], startMinute: 540, endMinute: 1020 }),
      ).toThrow(InvalidAvailabilityWindow);
    });

    it("rejects a weekday outside 0-6", () => {
      expect(() =>
        AvailabilityWindow.create({ days: [7], startMinute: 0, endMinute: 60 }),
      ).toThrow(InvalidAvailabilityWindow);
    });

    it("rejects a startMinute outside 0-1439", () => {
      expect(() =>
        AvailabilityWindow.create({ days: [1], startMinute: -1, endMinute: 60 }),
      ).toThrow(InvalidAvailabilityWindow);
    });

    it("rejects an endMinute greater than 1440", () => {
      expect(() =>
        AvailabilityWindow.create({ days: [1], startMinute: 0, endMinute: 1441 }),
      ).toThrow(InvalidAvailabilityWindow);
    });

    it("rejects a window where start is not before end", () => {
      expect(() =>
        AvailabilityWindow.create({ days: [1], startMinute: 600, endMinute: 600 }),
      ).toThrow(InvalidAvailabilityWindow);
    });

    it("rejects a non-integer minute (must be whole minutes)", () => {
      expect(() =>
        AvailabilityWindow.create({ days: [1], startMinute: 9.5, endMinute: 60 }),
      ).toThrow(InvalidAvailabilityWindow);
    });
  });

  describe("contains", () => {
    const window = AvailabilityWindow.create({
      days: [1, 2, 3, 4, 5], // Mon-Fri
      startMinute: 540, // 09:00
      endMinute: 1020, // 17:00
    });

    it("is true on an included weekday within the window", () => {
      expect(window.contains(1, 600)).toBe(true); // Monday 10:00
    });

    it("is inclusive at the start minute", () => {
      expect(window.contains(1, 540)).toBe(true); // Monday 09:00:00
    });

    it("is exclusive at the end minute", () => {
      expect(window.contains(1, 1020)).toBe(false); // Monday 17:00:00
    });

    it("is false before the start minute", () => {
      expect(window.contains(1, 539)).toBe(false); // Monday 08:59
    });

    it("is false on an excluded weekday even within the time range", () => {
      expect(window.contains(0, 600)).toBe(false); // Sunday 10:00
    });
  });

  describe("equals", () => {
    it("is true for structurally identical windows", () => {
      const a = AvailabilityWindow.create({ days: [1, 2], startMinute: 0, endMinute: 60 });
      const b = AvailabilityWindow.create({ days: [1, 2], startMinute: 0, endMinute: 60 });
      expect(a.equals(b)).toBe(true);
    });

    it("is false when days differ", () => {
      const a = AvailabilityWindow.create({ days: [1, 2], startMinute: 0, endMinute: 60 });
      const b = AvailabilityWindow.create({ days: [1, 3], startMinute: 0, endMinute: 60 });
      expect(a.equals(b)).toBe(false);
    });
  });
});
