"use client";

import { useEffect, useRef } from "react";

const metrics = [
  ["10B+", "Events Processed Daily"],
  ["99.999%", "System Resilience"],
  ["<5ms", "P99 Latency"],
];

const features = [
  {
    title: "Distributed Load Testing",
    description:
      "Simulate global traffic patterns and uncover pressure points before they cascade into incidents.",
  },
  {
    title: "Realtime Telemetry",
    description:
      "Stream high-frequency signals through live dashboards that keep operators close to system truth.",
  },
  {
    title: "Kafka Event Streaming",
    description:
      "Coordinate traffic, event fan-out, and durable pipelines across modern distributed services.",
  },
  {
    title: "Prometheus + Grafana",
    description:
      "Connect production-grade monitoring workflows to the same intelligence layer as your runtime data.",
  },
  {
    title: "AI Infrastructure Insights",
    description:
      "Turn logs, metrics, and traces into guided operational context instead of disconnected fragments.",
  },
  {
    title: "Distributed Intelligence",
    description:
      "Give teams a control surface for resilient systems with observability designed for motion and scale.",
  },
];

const pricingPlans = [
  {
    name: "Developer",
    price: "Free",
    subtitle: "For exploring the platform.",
    cta: "Start Building",
    highlighted: false,
    features: [
      "1M Events / Month",
      "7-Day Retention",
      "Community Support",
    ],
  },
  {
    name: "Production",
    price: "$299",
    suffix: "/mo",
    subtitle: "For scaling distributed teams.",
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "100M Events / Month",
      "30-Day Retention",
      "AI Anomaly Detection",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "For mission-critical infrastructure.",
    cta: "Contact Sales",
    highlighted: false,
    features: [
      "Unlimited Events",
      "Custom Retention",
      "Dedicated Success Manager",
      "SOC2 & HIPAA Compliance",
    ],
  },
];

const footerGroups = [
  {
    title: "Product",
    links: ["Platform", "Infrastructure", "Intelligence", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Docs", "API Reference", "Status", "Open Source"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Community"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security"],
  },
];

export default function HomePage() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;

    const ensurePlayback = () => {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    const handleCanPlay = () => {
      ensurePlayback();
    };

    video.addEventListener("canplay", handleCanPlay, { once: true });
    ensurePlayback();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  const handleSignup = () => {
    window.location.href = "/signup";
  }

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header
        className="hero-parallax relative isolate flex min-h-screen flex-col overflow-hidden px-6 pb-20 pt-28 text-center"
      >
        <div className="hero-media">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            disablePictureInPicture
            className="hero-video absolute inset-0 h-full w-full object-cover"
          >
            <source src="/video/ChaosVid.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
          <div className="hero-video-sheen" />
        </div>

        <div className="hero-backdrop" />
        <div className="hero-vignette" />
        <div className="hero-noise" />
        <div className="cyber-grid hero-grid opacity-40" />
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />
        <div className="hero-orb hero-orb-core" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center">
          <div className="hero-copy max-w-6xl">
            <div className="hero-pill mb-8 inline-flex items-center gap-3 px-6 py-3 text-sm text-cyan-200 backdrop-blur-xl">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.95)]" />
              AI-native observability infrastructure
            </div>

            <h1 className="hero-title text-6xl font-black leading-[0.92] tracking-tight text-white md:text-7xl xl:text-[8.5rem]">
              Infrastructure
              <br />
              Intelligence
              <br />
              <span className="hero-accent">for the Distributed Era.</span>
            </h1>

            <p className="mx-auto mt-10 max-w-4xl text-lg leading-8 text-slate-300 md:text-2xl md:leading-10">
              The operating system for intelligent distributed infrastructure.
              Realtime observability, Kafka event streaming, websocket telemetry,
              and AI-native infrastructure insights.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <button onClick={handleSignup} className="hero-cta-primary rounded-2xl px-8 py-4 text-lg font-semibold text-slate-950 transition hover:scale-[1.03]">
                Start Free Trial
              </button>

              <button className="hero-cta-secondary rounded-2xl px-8 py-4 text-lg font-semibold text-cyan-100 transition hover:bg-white/8">
                Book Technical Demo
              </button>
            </div>
          </div>
        </div>

        <div className="hero-status-panel hero-status-panel-bottom absolute bottom-8 left-6 z-10 rounded-3xl px-5 py-4 backdrop-blur-xl md:bottom-10 md:left-10 md:px-6 md:py-5">
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.9)]" />

            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 md:text-xs">
                Core Status
              </p>
              <h3 className="mt-1 text-xl font-bold text-cyan-200 md:text-2xl">
                Optimal
              </h3>
            </div>
          </div>
        </div>

        <div className="hero-floating-card hero-floating-card-right hidden rounded-3xl px-5 py-4 backdrop-blur-xl md:flex">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Telemetry
            </p>
            <p className="mt-2 text-3xl font-black text-white">12.4M/s</p>
            <p className="mt-1 text-sm text-cyan-200">Live event throughput</p>
          </div>
        </div>

        <div className="hero-floating-card hero-floating-card-left hidden rounded-3xl px-5 py-4 backdrop-blur-xl xl:flex">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Latency
            </p>
            <p className="mt-2 text-3xl font-black text-white">4.8ms</p>
            <p className="mt-1 text-sm text-cyan-200">Cross-region stream sync</p>
          </div>
        </div>

        <div className="hero-bottom-fade" />
      </header>

      <section className="relative z-10 -mt-10 px-6 pb-24 pt-32">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {metrics.map(([value, label]) => (
            <div key={label} className="glass-panel card-hover rounded-[28px] p-10 text-center">
              <h3 className="text-6xl font-black text-cyan-300">{value}</h3>
              <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.36))] px-6 py-24">
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-400">
              Platform Capabilities
            </p>

            <h2 className="mt-6 text-5xl font-black text-white md:text-6xl">
              Architected for Chaos
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-slate-400">
              Deep visibility into distributed systems through unified telemetry,
              realtime observability, and AI-native intelligence.
            </p>
          </div>

          <div className="grid auto-rows-[300px] gap-8 md:grid-cols-12">
            <article className="glass-panel card-hover group relative overflow-hidden rounded-[30px] p-8 md:col-span-8">
              <div className="hero-bento-glow absolute right-0 top-0 h-full w-[45%] opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
              <div className="absolute right-8 top-8 text-[7rem] font-black leading-none text-cyan-400/12">
                HUB
              </div>
              <div className="relative z-10 flex h-full max-w-xl flex-col justify-end text-left">
                <h3 className="text-3xl font-bold text-white md:text-4xl">
                  {features[0].title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  {features[0].description}
                </p>
              </div>
            </article>

            <article className="glass-panel card-hover relative flex flex-col justify-between overflow-hidden rounded-[30px] p-8 text-left md:col-span-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-bold text-cyan-300">
                  WS
                </div>
                <h3 className="text-2xl font-bold text-white">
                  WebSocket Telemetry
                </h3>
              </div>
              <p className="mt-8 text-lg leading-8 text-slate-400">
                Sub-millisecond real-time event streaming directly to your
                observability dashboards.
              </p>
            </article>

            <article className="glass-panel card-hover relative flex flex-col justify-between overflow-hidden rounded-[30px] p-8 text-left md:col-span-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-bold text-cyan-300">
                  PM
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Prometheus Native
                </h3>
              </div>
              <p className="mt-8 text-lg leading-8 text-slate-400">
                Seamless integration with Prometheus and Grafana for
                enterprise-grade analytics.
              </p>
            </article>

            <article className="glass-panel card-hover group relative overflow-hidden rounded-[30px] p-8 md:col-span-8">
              <div className="hero-ai-panel absolute inset-0 opacity-55 transition-opacity duration-300 group-hover:opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-transparent" />
              <div className="relative z-10 flex h-full max-w-xl flex-col justify-end text-left">
                <h3 className="text-3xl font-bold text-white md:text-4xl">
                  AI-Native Intelligence
                </h3>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  Predictive anomaly detection and automated root-cause analysis
                  powered by advanced machine learning models.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-5xl font-black text-white md:text-6xl">
              Transparent Scale
            </h2>
            <p className="mt-4 text-xl leading-8 text-slate-400">
              Enterprise-grade infrastructure without the enterprise opacity.
            </p>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`glass-panel relative flex h-full flex-col rounded-[30px] p-8 text-left ${
                  plan.highlighted
                    ? "hero-pricing-featured border-cyan-400/40 bg-cyan-400/[0.08] md:scale-[1.03]"
                    : ""
                }`}
              >
                {plan.badge ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-950">
                    {plan.badge}
                  </div>
                ) : null}

                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className={`text-[3rem] font-black leading-none ${
                        plan.highlighted ? "text-cyan-300" : "text-white"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.suffix ? (
                      <span className="text-base text-slate-400">{plan.suffix}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-base leading-7 text-slate-400">
                    {plan.subtitle}
                  </p>
                </div>

                <ul className="mb-8 flex flex-1 flex-col gap-4 text-base text-slate-300">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">
                        +
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-xl px-6 py-3 text-base font-bold transition ${
                    plan.highlighted
                      ? "hero-cta-primary text-slate-950 hover:scale-[1.01]"
                      : "hero-cta-secondary text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex justify-center overflow-hidden px-6 py-32">
        <div className="hero-bottom-glow absolute inset-0 z-0 opacity-50" />
        <div className="glass-panel relative z-10 max-w-4xl rounded-[36px] border border-cyan-400/20 p-12 text-center md:p-16">
          <h2 className="text-5xl font-black text-white md:text-[3.5rem]">
            Scale your intelligence.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-slate-400">
            Join the teams building the next generation of resilient
            infrastructure.
          </p>
          <button onClick={handleSignup} className="hero-cta-primary mt-10 rounded-2xl px-10 py-4 text-xl font-bold text-slate-950 transition hover:scale-[1.02]">
            Get Started Now
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[rgba(2,6,23,0.56)] px-6 pb-10 pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4 lg:grid-cols-6">
          <div className="space-y-4 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/12 text-sm font-black text-cyan-300">
                CF
              </div>
              <span className="text-2xl font-bold text-white">ChaosForge</span>
            </div>
            <p className="max-w-xs text-base leading-7 text-slate-400">
              © 2024 ChaosForge Intelligence. All rights reserved. Built for
              distributed resilience.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="flex flex-col space-y-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-300">
                {group.title}
              </h4>
              {group.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-base text-slate-400 transition-colors hover:text-cyan-300"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
