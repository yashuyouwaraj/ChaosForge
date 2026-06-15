"use client";

const roadmap = [
  "NVIDIA Nemotron Integration",
  "DeepSeek Operational Analyst",
  "Incident Narrator",
  "Infrastructure Copilot",
  "Autonomous Runbook Generation",
];

export function AiRoadmap() {
  return (
    <div className="glass rounded-[32px] p-8">
      <p
        className="
          text-sm uppercase
          tracking-[0.3em]
          text-cyan-400
        "
      >
        Future Intelligence
      </p>

      <h2
        className="
          mt-3 text-4xl
          font-black
        "
      >
        AI Roadmap
      </h2>

      <div
        className="
          mt-8 space-y-4
        "
      >
        {roadmap.map((item) => (
          <div
            key={item}
            className="
              flex items-center
              justify-between
              rounded-[20px]
              border border-white/10
              bg-black/20
              p-5
            "
          >
            <span>{item}</span>

            <span
              className="
                rounded-full
                bg-cyan-500/10
                px-3 py-1
                text-xs
                font-bold
                text-cyan-300
              "
            >
              Planned
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
