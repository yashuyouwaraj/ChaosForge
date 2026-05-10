export default function PlanBadge({ plan }) {
  const color =
    plan === "premium"
      ? "bg-purple-600"
      : plan === "pro"
        ? "bg-blue-600"
        : "bg-gray-600";
  return (
    <div className={`px-3 py-1 rounded-full text-sm ${color}`}>
      {plan.toUpperCase()}
    </div>
  );
}
