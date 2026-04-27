import InsightsGraphView from "../components/views/graph/InsightsGraphView";

interface InsightsGraphPageProps {
  folderId: string;
}

export default function InsightsGraphPage({
  folderId,
}: InsightsGraphPageProps) {
  return <InsightsGraphView folderId={folderId} />;
}
