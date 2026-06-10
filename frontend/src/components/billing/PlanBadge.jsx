export default function PlanBadge({ plan }) {
  const styles = {
    free: "bg-slate-500/10 text-slate-300",

    pro: "bg-cyan-500/10 text-cyan-300",

    enterprise: "bg-yellow-500/10 text-yellow-300",
  };

  return (
    <div
      className={`
        inline-flex
        rounded-full
        px-5 py-2
        text-sm font-bold
        uppercase
        tracking-[0.2em]
        ${styles[plan] || styles.free}
      `}
    >
      {plan}
    </div>
  );
}
