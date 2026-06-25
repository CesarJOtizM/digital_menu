import { describe, it, expect } from "vitest";
import { isCuid } from "@/shared/infrastructure/http/helpers/cuid";
import { CuidIdGenerator } from "./cuid-id-generator";

describe("CuidIdGenerator", () => {
  it("produces ids that satisfy the project's cuid validator", () => {
    const generator = new CuidIdGenerator();

    const id = generator.next();

    expect(isCuid(id)).toBe(true);
  });

  it("produces a distinct id on each call", () => {
    const generator = new CuidIdGenerator();

    const ids = new Set([
      generator.next(),
      generator.next(),
      generator.next(),
      generator.next(),
      generator.next(),
    ]);

    expect(ids.size).toBe(5);
  });

  it("starts every id with the cuid 'c' prefix", () => {
    const generator = new CuidIdGenerator();

    expect(generator.next().startsWith("c")).toBe(true);
  });
});
