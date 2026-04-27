import { use } from "react";
import InsightsGraphPage from "@/modules/research/pages/InsightsGraphPage";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  return <InsightsGraphPage folderId={resolvedParams.folderId} />;
}
