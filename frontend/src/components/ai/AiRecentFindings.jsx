"use client";

const severityStyles = {
  HIGH: {
    badge: "bg-red-500/10 text-red-300 border border-red-500/20",
  },

  MEDIUM: {
    badge: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
  },

  LOW: {
    badge: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  },
};

export function AiRecentFindings({ findings = [] }) {
  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div>
        <p
          className="
            text-sm uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          AI Findings
        </p>

        <h2
          className="
            mt-3 text-4xl
            font-black
          "
        >
          Recent Intelligence
        </h2>
      </div>

      {findings.length === 0 ? (
        <div
          className="
            mt-8 rounded-[24px]
            border border-white/10
            bg-black/20
            p-8 text-center
          "
        >
          <h3
            className="
              text-2xl font-bold
            "
          >
            No Active Findings
          </h3>

          <p
            className="
              mt-3 text-muted-foreground
            "
          >
            Infrastructure intelligence engines have not detected any
            significant anomalies or operational risks.
          </p>
        </div>
      ) : (
        <div
          className="
            mt-8 grid gap-6
            lg:grid-cols-3
          "
        >
          {findings.map((item, index) => {
            const style = severityStyles[item.severity] || severityStyles.LOW;

            return (
              <div
                key={`${item.title}-${index}`}
                className="
                    rounded-[24px]
                    border border-white/10
                    bg-black/20
                    p-6
                  "
              >
                <div
                  className={`
                      inline-flex
                      rounded-full
                      px-3 py-1
                      text-xs font-bold
                      uppercase
                      tracking-[0.15em]
                      ${style.badge}
                    `}
                >
                  {item.severity}
                </div>

                <h3
                  className="
                      mt-5 text-xl
                      font-bold
                    "
                >
                  {item.title}
                </h3>

                <p
                  className="
                      mt-4 leading-7
                      text-muted-foreground
                    "
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
