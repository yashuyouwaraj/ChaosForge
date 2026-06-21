"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { useMouseParallax, useVideoVisibility } from "@/hooks/useLandingEffects";

export function LandingHero() {
  const videoRef = useRef(null);
  const { registerLayer, handleMove } = useMouseParallax(12);

  useVideoVisibility(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;

    return undefined;
  }, []);

  return (
    <header
      className="hero-parallax relative isolate flex min-h-screen flex-col overflow-hidden px-6 pb-20 pt-28 text-center"
      onMouseMove={handleMove}
    >
      <div className="hero-media">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
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
      <div
        ref={registerLayer(0)}
        className="hero-orb hero-orb-left landing-parallax-layer"
      />
      <div
        ref={registerLayer(1)}
        className="hero-orb hero-orb-right landing-parallax-layer"
      />
      <div
        ref={registerLayer(2)}
        className="hero-orb hero-orb-core landing-parallax-layer"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center">
        <div
          ref={registerLayer(3)}
          className="hero-copy max-w-6xl landing-parallax-layer"
        >
          <div className="hero-pill mb-8 inline-flex items-center gap-3 px-6 py-3 text-sm text-cyan-200">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Load testing · Chaos engineering · AI intelligence
          </div>

          <h1 className="hero-title text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl md:text-7xl xl:text-[7rem]">
            Simulate traffic.
            <br />
            Inject chaos.
            <br />
            <span className="hero-accent">Deploy with confidence.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-slate-300 md:text-xl md:leading-9">
            ChaosForge is the infrastructure OS for distributed load testing, realtime
            telemetry, chaos engineering, and AI-powered operational intelligence — all
            in one platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="hero-cta-primary rounded-2xl px-8 py-4 text-lg font-semibold text-slate-950 transition hover:scale-[1.03]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="hero-cta-secondary rounded-2xl px-8 py-4 text-lg font-semibold text-cyan-100 transition hover:bg-white/8"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-status-panel hero-status-panel-bottom absolute bottom-8 left-6 z-10 rounded-3xl px-5 py-4 md:bottom-10 md:left-10">
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.9)]" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
              Intelligence Engine
            </p>
            <h3 className="mt-1 text-xl font-bold text-cyan-200 md:text-2xl">11 Active</h3>
          </div>
        </div>
      </div>

      <div className="hero-bottom-fade" />
    </header>
  );
}
