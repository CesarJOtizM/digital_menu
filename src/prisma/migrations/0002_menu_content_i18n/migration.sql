-- Optional English translations for menu content (default locale stays in primary columns).

ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;

ALTER TABLE "Item" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Item" ADD COLUMN "descriptionEn" TEXT;

ALTER TABLE "Variant" ADD COLUMN "labelEn" TEXT;

ALTER TABLE "ModifierGroup" ADD COLUMN "nameEn" TEXT;

ALTER TABLE "ModifierOption" ADD COLUMN "nameEn" TEXT;

ALTER TABLE "Allergen" ADD COLUMN "nameEn" TEXT;
