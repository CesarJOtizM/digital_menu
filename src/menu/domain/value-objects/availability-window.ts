import { InvalidAvailabilityWindow } from "../errors";

const MINUTES_PER_DAY = 1440;
const MIN_WEEKDAY = 0;
const MAX_WEEKDAY = 6;

export interface AvailabilityWindowProps {
  days: number[];
  startMinute: number;
  endMinute: number;
}

/**
 * Immutable time-of-week window: a set of weekdays (0=Sunday..6=Saturday) plus
 * a minute-of-day range. Start is inclusive, end is exclusive. Timezone is NOT
 * part of the window — it is applied by the AvailabilityResolver at evaluation.
 */
export class AvailabilityWindow {
  private constructor(
    private readonly _days: readonly number[],
    private readonly _startMinute: number,
    private readonly _endMinute: number,
  ) {}

  static create(props: AvailabilityWindowProps): AvailabilityWindow {
    const { days, startMinute, endMinute } = props;

    if (days.length === 0) {
      throw new InvalidAvailabilityWindow("Window must include at least one day");
    }
    for (const day of days) {
      if (!Number.isInteger(day) || day < MIN_WEEKDAY || day > MAX_WEEKDAY) {
        throw new InvalidAvailabilityWindow(
          `Weekday must be an integer in ${MIN_WEEKDAY}-${MAX_WEEKDAY}`,
        );
      }
    }
    AvailabilityWindow.assertMinute(startMinute, "startMinute");
    AvailabilityWindow.assertMinute(endMinute, "endMinute");
    if (startMinute >= endMinute) {
      throw new InvalidAvailabilityWindow("startMinute must be before endMinute");
    }

    return new AvailabilityWindow([...days], startMinute, endMinute);
  }

  private static assertMinute(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 0 || value > MINUTES_PER_DAY) {
      throw new InvalidAvailabilityWindow(
        `${label} must be an integer in 0-${MINUTES_PER_DAY}`,
      );
    }
  }

  get days(): number[] {
    return [...this._days];
  }

  get startMinute(): number {
    return this._startMinute;
  }

  get endMinute(): number {
    return this._endMinute;
  }

  /**
   * True when the given weekday + minute-of-day fall inside this window.
   * Start inclusive, end exclusive.
   */
  contains(weekday: number, minuteOfDay: number): boolean {
    if (!this._days.includes(weekday)) {
      return false;
    }
    return minuteOfDay >= this._startMinute && minuteOfDay < this._endMinute;
  }

  equals(other: AvailabilityWindow): boolean {
    return (
      this._startMinute === other._startMinute &&
      this._endMinute === other._endMinute &&
      this._days.length === other._days.length &&
      this._days.every((day, index) => day === other._days[index])
    );
  }
}
