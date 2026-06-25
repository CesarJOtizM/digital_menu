import { randomBytes } from "node:crypto";
import type { IdGenerator } from "@/menu/application/ports/id-generator";

const BASE36 = 36;
// cuid validator is /^c[a-z0-9]{24,}$/ — produce a 'c' prefix plus >=24 base36 chars.
const BODY_LENGTH = 24;

/**
 * IdGenerator adapter producing collision-resistant, cuid-shaped ids
 * (lowercase base36, 'c' prefix) compatible with the project's `isCuid`
 * validator and the Prisma cuid id columns. Uses crypto entropy plus a
 * monotonic counter so ids generated in the same tick stay distinct.
 */
export class CuidIdGenerator implements IdGenerator {
  private counter = Math.floor(Math.random() * BASE36 ** 4);

  next(): string {
    this.counter = (this.counter + 1) % BASE36 ** 8;

    const time = Date.now().toString(BASE36);
    const count = this.counter.toString(BASE36).padStart(8, "0");
    const random = randomBytes(16).toString("hex").replace(/[^0-9a-f]/g, "");

    const body = `${time}${count}${random}`.slice(0, BODY_LENGTH).padEnd(BODY_LENGTH, "0");
    return `c${body}`;
  }
}
