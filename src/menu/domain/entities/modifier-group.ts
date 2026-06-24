import { Entity, Price } from "@/shared/domain";
import { ModifierOption } from "../value-objects/modifier-option";
import {
  InvalidModifierGroup,
  ModifierSelectionAboveMax,
  ModifierSelectionBelowMin,
  UnknownModifierOption,
} from "../errors";

export interface ModifierGroupProps {
  id: string;
  name: string;
  min: number;
  max: number;
  position: number;
  options: ModifierOption[];
}

export type IdFactory = () => string;

/**
 * Item-local group of modifier options with min/max selection rules. Owned by a
 * single Item — never shared. Validates a selection and computes the summed
 * price delta of the selected options, all in integer centavos.
 */
export class ModifierGroup extends Entity<string> {
  private constructor(
    id: string,
    private readonly _name: string,
    private readonly _min: number,
    private readonly _max: number,
    private readonly _position: number,
    private readonly _options: readonly ModifierOption[],
  ) {
    super(id);
  }

  static create(props: ModifierGroupProps): ModifierGroup {
    const { id, name, min, max, position, options } = props;

    if (!Number.isInteger(min) || min < 0) {
      throw new InvalidModifierGroup("min must be a non-negative integer");
    }
    if (!Number.isInteger(max) || max < min) {
      throw new InvalidModifierGroup("max must be an integer >= min");
    }
    if (max > options.length) {
      throw new InvalidModifierGroup(
        "max cannot exceed the number of available options",
      );
    }

    return new ModifierGroup(id, name, min, max, position, [...options]);
  }

  get name(): string {
    return this._name;
  }

  get min(): number {
    return this._min;
  }

  get max(): number {
    return this._max;
  }

  get position(): number {
    return this._position;
  }

  get options(): ModifierOption[] {
    return [...this._options];
  }

  /** Throws a domain error when the selection violates membership or bounds. */
  validateSelection(selectedOptionIds: string[]): void {
    this.assertOptionsExist(selectedOptionIds);
    if (selectedOptionIds.length < this._min) {
      throw new ModifierSelectionBelowMin(
        `Group "${this._name}" requires at least ${this._min} option(s)`,
      );
    }
    if (selectedOptionIds.length > this._max) {
      throw new ModifierSelectionAboveMax(
        `Group "${this._name}" allows at most ${this._max} option(s)`,
      );
    }
  }

  /** Sum of the priceDeltas of the selected options, in integer centavos. */
  priceDeltaFor(selectedOptionIds: string[]): Price {
    this.assertOptionsExist(selectedOptionIds);
    return selectedOptionIds.reduce<Price>((total, optionId) => {
      const option = this._options.find((candidate) => candidate.id === optionId);
      // assertOptionsExist guarantees option is defined here.
      return total.add(option!.priceDelta);
    }, Price.create(0));
  }

  /** Deep-clone the group and all options with brand-new ids. */
  cloneWithFreshIds(nextId: IdFactory): ModifierGroup {
    const newGroupId = nextId();
    const clonedOptions = this._options.map((option) =>
      option.cloneWithId(nextId()),
    );
    return new ModifierGroup(
      newGroupId,
      this._name,
      this._min,
      this._max,
      this._position,
      clonedOptions,
    );
  }

  private assertOptionsExist(optionIds: string[]): void {
    for (const optionId of optionIds) {
      const exists = this._options.some((option) => option.id === optionId);
      if (!exists) {
        throw new UnknownModifierOption(
          `Option "${optionId}" does not belong to group "${this._name}"`,
        );
      }
    }
  }
}
