export default function PremiumGate({ plan, required = "pro", onUpgrade, children }) {
  const requiredPlan = required.toLowerCase();
  const label = requiredPlan.toUpperCase();
  const allowed =
    plan === "premium" || (plan === "pro" && requiredPlan !== "premium");
  const borderColor =
    requiredPlan === "premium" ? "border-purple-400" : "border-blue-400";
  const buttonColor =
    requiredPlan === "premium" ? "bg-purple-500" : "bg-blue-500";

  if (!allowed) {
    return (
      <div
        className={`bg-white/10 backdrop-blur-md border ${borderColor} rounded-xl p-6 text-center`}
      >
        <h2 className="text-lg mb-2">{label} Feature</h2>
        <p className="text-gray-300 mb-4">
          Upgrade to {label} to unlock this.
        </p>

        <button
          type="button"
          onClick={onUpgrade}
          className={`${buttonColor} px-4 py-2 rounded-lg`}
        >
          Upgrade to {label}
        </button>
      </div>
    );
  }

  return children;
}
