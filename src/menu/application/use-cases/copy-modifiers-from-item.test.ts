import { describe, it, expect } from "vitest";
import { CopyModifiersFromItem } from "./copy-modifiers-from-item";
import { Item } from "../../domain/entities/item";
import { ModifierGroup } from "../../domain/entities/modifier-group";
import { ModifierOption } from "../../domain/value-objects/modifier-option";
import type { ItemRepository } from "../ports/item-repository";
import type { IdGenerator } from "../ports/id-generator";
import { Price, ImageSource, Slug } from "@/shared/domain";

const makeItem = (id: string, groups: ModifierGroup[] = []): Item =>
  Item.create({
    id,
    name: id,
    slug: Slug.fromName(id),
    description: "",
    basePrice: Price.create(1500),
    imageSource: ImageSource.placeholder(),
    active: true,
    position: 0,
    allergenIds: [],
    variants: [],
    modifierGroups: groups,
  });

const sourceGroup = (): ModifierGroup =>
  ModifierGroup.create({
    id: "grp-source",
    name: "Extras",
    min: 0,
    max: 2,
    position: 0,
    options: [
      ModifierOption.create({ id: "opt-bacon", name: "Bacon", priceDelta: Price.create(300) }),
      ModifierOption.create({ id: "opt-egg", name: "Egg", priceDelta: Price.create(150) }),
    ],
  });

class InMemoryItemRepository implements ItemRepository {
  private readonly store = new Map<string, Item>();

  seed(item: Item): void {
    this.store.set(item.id, item);
  }

  async findById(id: string): Promise<Item | null> {
    return this.store.get(id) ?? null;
  }

  async save(item: Item): Promise<void> {
    this.store.set(item.id, item);
  }
}

class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  next(): string {
    return `new-${this.counter++}`;
  }
}

describe("CopyModifiersFromItem", () => {
  it("copies the source modifier groups onto the target item", async () => {
    const repo = new InMemoryItemRepository();
    repo.seed(makeItem("source", [sourceGroup()]));
    repo.seed(makeItem("target", []));

    const useCase = new CopyModifiersFromItem(repo, new SequentialIdGenerator());
    await useCase.execute({ sourceItemId: "source", targetItemId: "target" });

    const target = await repo.findById("target");
    expect(target?.modifierGroups).toHaveLength(1);
    expect(target?.modifierGroups[0].options).toHaveLength(2);
  });

  it("assigns brand-new ids to the cloned groups and options (no shared ids)", async () => {
    const repo = new InMemoryItemRepository();
    repo.seed(makeItem("source", [sourceGroup()]));
    repo.seed(makeItem("target", []));

    const useCase = new CopyModifiersFromItem(repo, new SequentialIdGenerator());
    await useCase.execute({ sourceItemId: "source", targetItemId: "target" });

    const source = await repo.findById("source");
    const target = await repo.findById("target");
    const sourceGroupId = source!.modifierGroups[0].id;
    const targetGroupId = target!.modifierGroups[0].id;
    const sourceOptionIds = source!.modifierGroups[0].options.map((o) => o.id);
    const targetOptionIds = target!.modifierGroups[0].options.map((o) => o.id);

    expect(targetGroupId).not.toBe(sourceGroupId);
    for (const targetOptionId of targetOptionIds) {
      expect(sourceOptionIds).not.toContain(targetOptionId);
    }
  });

  it("preserves the copied data (names and price deltas) on the target", async () => {
    const repo = new InMemoryItemRepository();
    repo.seed(makeItem("source", [sourceGroup()]));
    repo.seed(makeItem("target", []));

    const useCase = new CopyModifiersFromItem(repo, new SequentialIdGenerator());
    await useCase.execute({ sourceItemId: "source", targetItemId: "target" });

    const target = await repo.findById("target");
    const group = target!.modifierGroups[0];
    expect(group.name).toBe("Extras");
    expect(group.priceDeltaFor(group.options.map((o) => o.id)).value).toBe(450);
  });

  it("clone is INDEPENDENT: mutating the source later does not affect the target", async () => {
    const repo = new InMemoryItemRepository();
    repo.seed(makeItem("source", [sourceGroup()]));
    repo.seed(makeItem("target", []));

    const useCase = new CopyModifiersFromItem(repo, new SequentialIdGenerator());
    await useCase.execute({ sourceItemId: "source", targetItemId: "target" });

    const targetBefore = await repo.findById("target");
    const targetGroupIdBefore = targetBefore!.modifierGroups[0].id;

    // Replace the source's modifier groups entirely (simulate later edit).
    const source = await repo.findById("source");
    const mutatedSource = source!.replaceModifierGroups([
      ModifierGroup.create({
        id: "grp-changed",
        name: "Totally Different",
        min: 0,
        max: 1,
        position: 0,
        options: [
          ModifierOption.create({ id: "opt-x", name: "X", priceDelta: Price.create(9999) }),
        ],
      }),
    ]);
    await repo.save(mutatedSource);

    const targetAfter = await repo.findById("target");
    expect(targetAfter!.modifierGroups[0].id).toBe(targetGroupIdBefore);
    expect(targetAfter!.modifierGroups[0].name).toBe("Extras");
    expect(targetAfter!.modifierGroups[0].options.map((o) => o.id)).not.toContain("opt-x");
  });
});
