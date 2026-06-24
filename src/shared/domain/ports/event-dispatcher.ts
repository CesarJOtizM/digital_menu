import type { DomainEvent } from "../events";

export interface EventDispatcher {
  dispatch(events: readonly DomainEvent[]): Promise<void>;
}
