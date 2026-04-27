import CardListView from "../components/views/CardListView";

export default function ListResearchPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        padding: "24px 6vw",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <CardListView />
    </div>
  );
}
