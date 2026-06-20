"use client";

import { useState } from "react";
import { Layers3 } from "lucide-react";

import { useProject } from "@/components/providers/ProjectProvider";
import { applyChaosProfile, CHAOS_PROFILES } from "@/lib/chaos";
import { toast } from "@/lib/toast";

export function ChaosProfileCard({ chaos, setChaos }) {
  const { projectId } = useProject();
  const [applying, setApplying] = useState(false);

  const handleProfileChange = async (event) => {
    const profile = event.target.value;
    setApplying(true);

    try {
      const nextChaos = await applyChaosProfile(projectId, profile);
      setChaos(nextChaos);
      toast.success(
        "Chaos profile applied",
        `${profile[0].toUpperCase()}${profile.slice(1)} controls are ready.`,
      );
    } catch (err) {
      toast.error("Unable to apply Chaos profile", err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <Layers3 className="h-5 w-5 text-cyan-400" />
        <h2 className="text-xl font-bold">Chaos Profile</h2>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Choose a preset configuration.
      </p>

      <select
        aria-label="Chaos profile"
        disabled={applying}
        className="mt-6 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 capitalize outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-60"
        value={chaos.profile}
        onChange={handleProfileChange}
      >
        {CHAOS_PROFILES.map((profile) => (
          <option key={profile} value={profile}>
            {profile}
          </option>
        ))}
      </select>

      {applying ? (
        <p className="mt-3 text-sm text-cyan-300" role="status">
          Applying profile...
        </p>
      ) : null}
    </div>
  );
}
