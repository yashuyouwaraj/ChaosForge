"use client";

import { useEffect, useState } from "react";

import { Play, Pause, RotateCcw } from "lucide-react";

import { useIncidentReplay } from "@/hooks/useIncidentReplay";

export function IncidentReplayCenter() {
  const frames = useIncidentReplay();

  const [playing, setPlaying] = useState(false);

  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!playing || frames.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= frames.length - 1) {
          setPlaying(false);
          return prev;
        }

        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [playing, frames]);

  const frame = frames[currentFrame];

  const handlePlayPause = () => setPlaying(!playing);

  const handleReset = () => {
    setCurrentFrame(0);
    setPlaying(false);
  };

  return (
    <div
      className="
        glass rounded-[32px]
        p-8
      "
    >
      <div
        className="
          flex items-center
          justify-between
        "
      >
        <div>
          <h3
            className="
              text-3xl font-black
            "
          >
            Incident Replay
          </h3>

          <p
            className="
              mt-3 text-muted-foreground
            "
          >
            Replay how the operational incident unfolded over time.
          </p>
        </div>

        <div
          className="
            flex gap-3
          "
        >
          <button
            onClick={handlePlayPause}
            className="
              rounded-xl
              bg-cyan-500
              px-4 py-3
              text-black
            "
            aria-label={playing ? "Pause replay" : "Play replay"}
          >
            {playing ? <Pause /> : <Play />}
          </button>

          <button
            onClick={handleReset}
            className="
              rounded-xl
              border border-white/10
              px-4 py-3
            "
            aria-label="Reset replay"
          >
            <RotateCcw />
          </button>
        </div>
      </div>

      {frames.length === 0 ? (
        <div
          className="
            mt-10 rounded-[28px]
            border border-yellow-500/20
            bg-yellow-500/5
            p-8
            text-center
            text-muted-foreground
          "
        >
          <p>No incidents recorded for this run.</p>
          <p className="mt-2 text-sm">Run a simulation to generate incident data.</p>
        </div>
      ) : frame ? (
        <div
          className="
            mt-10 rounded-[28px]
            border border-cyan-500/20
            bg-cyan-500/5
            p-8
          "
        >
          <div
            className="
              text-sm
              uppercase
              tracking-[0.2em]
              text-cyan-300
            "
          >
            Step {frame.step} of {frames.length}
          </div>

          <h2
            className="
              mt-4 text-4xl
              font-black
            "
          >
            {frame.title}
          </h2>

          <p
            className="
              mt-4 text-slate-300
            "
          >
            {frame.message}
          </p>

          <div
            className="
              mt-6 flex gap-6
              text-sm
              text-muted-foreground
            "
          >
            <span className="capitalize">{frame.type}</span>

            <span className="capitalize">{frame.severity}</span>

            <span>{new Date(frame.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
