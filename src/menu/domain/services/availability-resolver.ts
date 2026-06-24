import { AvailabilityWindow } from "../value-objects/availability-window";

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

interface LocalMoment {
  weekday: number;
  minuteOfDay: number;
}

/**
 * Pure domain service that decides whether an availability window includes a
 * given instant in a configured IANA timezone. Uses Intl.DateTimeFormat to
 * derive the LOCAL weekday and minute-of-day from a UTC Date, which is
 * DST-correct (no naive offset math). No I/O, no clock access — `now` is passed in.
 */
export class AvailabilityResolver {
  isAvailable(
    window: AvailabilityWindow | undefined,
    now: Date,
    timezone: string,
  ): boolean {
    if (!window) {
      return true;
    }
    const { weekday, minuteOfDay } = this.toLocalMoment(now, timezone);
    return window.contains(weekday, minuteOfDay);
  }

  private toLocalMoment(now: Date, timezone: string): LocalMoment {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const lookup = (type: string): string =>
      parts.find((part) => part.type === type)?.value ?? "";

    const weekday = WEEKDAY_INDEX[lookup("weekday")];
    // Intl can emit "24" for midnight in hour12:false; normalize to 0.
    const hour = Number(lookup("hour")) % 24;
    const minute = Number(lookup("minute"));

    return { weekday, minuteOfDay: hour * 60 + minute };
  }
}
