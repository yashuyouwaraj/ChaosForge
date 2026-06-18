"use client";

import { AlertTriangle, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/components/providers/ProjectProvider";
import { useRun } from "@/components/providers/RunProvider";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export function DangerZoneCard({ reloadSettings }) {
  const router = useRouter();
  const { setProjectId } = useProject();
  const { setSelectedRun } = useRun();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const resetSettings = async () => {
    try {
      setLoading(true);

      await api("/settings/reset", "POST");

      await reloadSettings();
      toast.success("Settings restored to defaults.");
      setModal(null);
    } catch (err) {
      toast.error("Something went wrong", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProjects = async () => {
    try {
      setLoading(true);

      await api("/projects", "DELETE");
      setProjectId(null);
      setSelectedRun({
        projectId: null,
        runId: null,
        status: null,
      });
      localStorage.removeItem("projectId");
      localStorage.removeItem("currentRunId");
      localStorage.removeItem("currentRunActive");
      window.dispatchEvent(new Event("chaosforge:projects-changed"));
      toast.success("All projects deleted successfully.");
      setModal(null);

      if (window.location.pathname.startsWith("/dashboard")) {
        router.push("/projects");
      }
    } catch (err) {
      toast.error("Something went wrong", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        glass
        rounded-[32px]
        border
        border-red-500/20
        p-8
      "
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className="
            h-7
            w-7
            text-red-400
          "
        />

        <h2 className="text-3xl font-black">Danger Zone</h2>
      </div>

      <p
        className="
          mt-3
          text-muted-foreground
        "
      >
        These actions are irreversible.
      </p>

      <div className="mt-8 space-y-5">
        <ActionCard
          icon={RotateCcw}
          title="Reset Settings"
          description="Restore all settings to their default values."
          button="Reset"
          color="cyan"
          onClick={() => setModal("reset")}
          loading={loading}
        />

        <ActionCard
          icon={Trash2}
          title="Delete All Projects"
          description="Remove every project and simulation permanently."
          button="Delete"
          color="red"
          onClick={() => setModal("delete")}
          loading={loading}
        />
      </div>

      {modal === "reset" ? (
        <ConfirmModal
          title="Reset all settings?"
          description="This will restore:"
          items={["Appearance", "Simulation Defaults", "Notifications"]}
          confirmLabel="Reset Settings"
          confirmClassName="cf-accent-bg text-black"
          loading={loading}
          onCancel={() => setModal(null)}
          onConfirm={resetSettings}
        />
      ) : null}

      {modal === "delete" ? (
        <ConfirmModal
          title="Delete all projects?"
          description="This removes every project, run, and associated project data."
          items={[
            "Projects",
            "Runs",
            "Infrastructure memories",
            "Project incidents",
          ]}
          confirmLabel="Delete Projects"
          confirmClassName="bg-red-500 text-white hover:bg-red-400"
          loading={loading}
          onCancel={() => setModal(null)}
          onConfirm={deleteProjects}
        />
      ) : null}
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  items,
  confirmLabel,
  confirmClassName,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#020617] p-6 shadow-2xl shadow-black/40">
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>

        <ul className="mt-5 space-y-3 text-sm text-slate-200">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-50 ${confirmClassName}`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  button,
  color,
  onClick,
  loading,
}) {
  const buttonClasses =
    color === "red"
      ? "bg-red-500 hover:bg-red-400 text-white"
      : "cf-accent-bg text-black";

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-black/20
        p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-6
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div className="flex gap-4">
          <Icon
            className="
              h-7
              w-7
              text-red-400
            "
          />

          <div>
            <h3 className="text-xl font-bold">{title}</h3>

            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className={`
            rounded-xl
            px-6
            py-3
            font-bold
            transition
            ${buttonClasses}
          `}
        >
          {loading ? "Please wait..." : button}
        </button>
      </div>
    </div>
  );
}
