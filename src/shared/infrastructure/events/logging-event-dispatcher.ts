import type { DomainEvent } from "@/shared/domain";
import type { EventDispatcher } from "@/shared/domain/ports";

export class LoggingEventDispatcher implements EventDispatcher {
  async dispatch(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      console.info(
        `[EventDispatcher] ${event.eventName} on aggregate#${event.aggregateId}`,
      );
    }
  }
}
