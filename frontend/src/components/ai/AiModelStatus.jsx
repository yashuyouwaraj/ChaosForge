"use client";

const models = [
  "Predictive Risk Engine",
  "Root Cause Engine",
  "Infrastructure Memory",
  "Remediation Engine",
];

export function AiModelStatus() {
  return (
    <div className="glass rounded-[32px] p-8">
      <p
        className="
          text-sm uppercase
          tracking-[0.3em]
          text-cyan-400
        "
      >
        AI Infrastructure
      </p>

      <h2
        className="
          mt-3 text-4xl
          font-black
        "
      >
        Model Status
      </h2>

      <div
        className="
          mt-8 grid gap-5
          md:grid-cols-2
        "
      >
        {models.map((model) => (
          <div
            key={model}
            className="
              flex items-center
              justify-between
              rounded-[24px]
              border border-white/10
              bg-black/20
              p-5
            "
          >
            <span>{model}</span>

            <span
              className="
                rounded-full
                bg-green-500/10
                px-3 py-1
                text-xs
                font-bold
                text-green-400
              "
            >
              Operational
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
