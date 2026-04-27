import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { IdeaDetailPage } from "@/modules/ideas";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("ideaDetail");
  const { id } = await params;
  return {
    title: `${t("title")} | Idea ${id}`,
  };
}

export default async function IdeaRoute({ params }: Props) {
  const { id } = await params;
  return <IdeaDetailPage id={id} />;
}
