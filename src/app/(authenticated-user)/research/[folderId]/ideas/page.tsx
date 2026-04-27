import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { FolderIdeasPage } from "@/modules/research";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ideasPage");
  return { title: t("title") };
}

interface Props {
  params: Promise<{ folderId: string }>;
}

export default async function FolderIdeasRoute({ params }: Props) {
  const { folderId } = await params;
  return <FolderIdeasPage folderId={folderId} />;
}
