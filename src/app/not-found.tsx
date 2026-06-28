import { getTranslations } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslations();

  return (
    <div>
      <h2>{t("errors.notFoundTitle")}</h2>
      <p>{t("errors.notFoundBody")}</p>
    </div>
  );
}
