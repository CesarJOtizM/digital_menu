/**
 * Driven port for generating fresh entity ids. Keeps id generation (cuid, uuid,
 * etc.) out of the domain/application layer; infrastructure supplies the adapter.
 */
export interface IdGenerator {
  next(): string;
}
