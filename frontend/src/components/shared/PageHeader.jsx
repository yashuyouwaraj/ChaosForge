"use client";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section
      className="
        relative overflow-hidden
        rounded-[32px]
        border border-white/10
        bg-white/[0.03]
        p-8 lg:p-10
      "
    >
      {/* BACKGROUND GLOW */}

      <div
        className="
          absolute right-0 top-0
          h-64 w-64
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative z-10">
        {/* EYEBROW */}

        <p
          className="
            text-xs uppercase
            tracking-[0.35em]
            text-cyan-400
          "
        >
          {eyebrow}
        </p>

        {/* TITLE */}

        <h1
          className="
            mt-5 max-w-5xl
            text-4xl font-black
            leading-tight
            lg:text-5xl
          "
        >
          {title}
        </h1>

        {/* DESCRIPTION */}

        <p
          className="
            mt-6 max-w-3xl
            text-lg leading-8
            text-slate-400
          "
        >
          {description}
        </p>

        {/* EXTRA */}

        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}