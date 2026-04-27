import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { FolderResearchPage } from "@/modules/research";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("interviews");
  return { title: t("title") };
}

interface Props {
  params: Promise<{ folderId: string }>;
}

export default async function FolderRoute({ params }: Props) {
  const { folderId } = await params;
  return <FolderResearchPage folderId={folderId} />;
}
