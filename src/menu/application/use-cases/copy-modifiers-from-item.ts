import type { ItemRepository } from "../ports/item-repository";
import type { IdGenerator } from "../ports/id-generator";

export interface CopyModifiersCommand {
  sourceItemId: string;
  targetItemId: string;
}

/**
 * Application use-case: copy the modifier groups of a source Item onto a target
 * Item. Modifiers are item-local, so this DEEP-CLONES every group and option
 * with brand-new ids — the target shares NO id/FK with the source. A later edit
 * to either item leaves the other untouched.
 */
export class CopyModifiersFromItem {
  constructor(
    private readonly items: ItemRepository,
    private readonly ids: IdGenerator,
  ) {}

  async execute(command: CopyModifiersCommand): Promise<void> {
    const source = await this.items.findById(command.sourceItemId);
    if (!source) {
      throw new Error(`Source item "${command.sourceItemId}" not found`);
    }
    const target = await this.items.findById(command.targetItemId);
    if (!target) {
      throw new Error(`Target item "${command.targetItemId}" not found`);
    }

    const clonedGroups = source.modifierGroups.map((group) =>
      group.cloneWithFreshIds(() => this.ids.next()),
    );

    const updatedTarget = target.replaceModifierGroups(clonedGroups);
    await this.items.save(updatedTarget);
  }
}
