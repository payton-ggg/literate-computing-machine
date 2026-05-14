import { use } from "react";
import { JobTreePage } from "@/modules/research/pages/JobTreePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  return <JobTreePage interviewId={resolvedParams.id} />;
}