"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";

import { useProject } from "@/components/providers/ProjectProvider";
import { Button } from "@/components/ui/button";
import {
  resetChaosSettings,
  updateChaosSettings,
} from "@/lib/chaos";
import { toast } from "@/lib/toast";

export function ChaosActionsCard({ chaos, setChaos, reload }) {
  const { projectId } = useProject();
  const [action, setAction] = useState("");

  const saveChaos = async () => {
    setAction("save");

    try {
      const savedChaos = await updateChaosSettings(projectId, chaos);
      setChaos(savedChaos);
      toast.success(
        "Chaos configuration saved",
        "The project will use these controls for future simulation requests.",
      );
    } catch (err) {
      toast.error("Unable to save Chaos configuration", err.message);
    } finally {
      setAction("");
    }
  };

  const resetChaos = async () => {
    setAction("reset");

    try {
      const resetChaos = await resetChaosSettings(projectId);
      setChaos(resetChaos);
      toast.success(
        "Chaos configuration reset",
        "All injectors have returned to their default disabled state.",
      );
      await reload();
    } catch (err) {
      toast.error("Unable to reset Chaos configuration", err.message);
    } finally {
      setAction("");
    }
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={saveChaos}
          disabled={Boolean(action)}
          className="h-11 rounded-xl bg-cyan-500 px-5 font-bold text-black hover:bg-cyan-400"
        >
          <Save />
          {action === "save" ? "Saving..." : "Save Configuration"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={resetChaos}
          disabled={Boolean(action)}
          className="h-11 rounded-xl border-red-500/30 bg-red-500/5 px-5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
        >
          <RotateCcw />
          {action === "reset" ? "Resetting..." : "Reset"}
        </Button>
      </div>
    </div>
  );
}
