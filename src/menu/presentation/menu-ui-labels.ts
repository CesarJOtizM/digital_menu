export interface ItemDetailLabels {
  readonly unavailable: string;
  readonly closeDetail: string;
  readonly detailSheetAria: string;
  /** Template with `{name}` — interpolate on the client via {@link formatLabel}. */
  readonly viewDetailAria: string;
  readonly variantsSection: string;
  readonly modifiersSection: string;
  readonly allergensSection: string;
}

export interface MenuUiLabels {
  readonly subtitle: string;
  readonly emptyTitle: string;
  readonly emptyBody: string;
  readonly categoryNavAria: string;
  readonly unavailable: string;
  readonly home: string;
  /** Accessible label for the list/cards view toggle control. */
  readonly viewToggleAria: string;
  /** Label + accessible name for the editorial list layout option. */
  readonly listView: string;
  /** Label + accessible name for the image-forward card grid option. */
  readonly cardsView: string;
  readonly itemDetail: ItemDetailLabels;
}
