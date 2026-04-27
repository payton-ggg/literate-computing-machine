import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { IdeasPage } from "@/modules/ideas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ideasPage");
  return { title: t("title") };
}

export default function IdeasRoute() {
  return <IdeasPage />;
}
