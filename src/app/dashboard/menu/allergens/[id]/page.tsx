import { notFound } from "next/navigation";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { AllergenForm } from "../../_components/allergen-form";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("allergens.edit") };
}

export default async function EditAllergenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { t } = await getTranslations();

  const allergen = await prisma.allergen.findUnique({ where: { id } });
  if (!allergen) {
    notFound();
  }

  return (
    <AllergenForm
      allergenId={id}
      initialName={allergen.name}
      initialIcon={allergen.icon ?? ""}
      title={t("allergens.editNamed", { name: allergen.name })}
      error={query.error}
      errorParams={extractAdminErrorParams(query)}
    />
  );
}
