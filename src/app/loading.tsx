import { Loader } from "@/shared/presentation";
import { getTranslations } from "@/i18n/server";

export default async function Loading() {
  const { t } = await getTranslations();
  return <Loader label={t("common.loading")} />;
}
