"use client";

import { Gauge, Globe, Lock, Send } from "lucide-react";
import { useEffect, useState } from "react";

const inputClass = `
w-full
rounded-xl
border border-white/10
bg-black/20
px-4 py-3
outline-none
transition
focus:border-cyan-400
cf-accent-ring
`;

export function SimulationDefaultsCard({ settings, updateSettings }) {
  const simulation = settings.simulationDefaults || {};
  const [headersDraft, setHeadersDraft] = useState("{}");
  const [payloadDraft, setPayloadDraft] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    setHeadersDraft(JSON.stringify(simulation.headers || {}, null, 2));
    setPayloadDraft(JSON.stringify(simulation.payload || {}, null, 2));
  }, [simulation.headers, simulation.payload]);

  const updateField = async (field, value) => {
    await updateSettings({
      simulationDefaults: {
        ...simulation,
        [field]: value,
      },
    });
  };

  const saveJsonField = async (field, value) => {
    try {
      const parsed = value.trim() ? JSON.parse(value) : {};

      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("JSON value must be an object.");
      }

      setJsonError("");
      await updateField(field, parsed);
    } catch (err) {
      setJsonError(err.message || "Enter valid JSON before saving.");
    }
  };

  return (
    <div className="glass rounded-[32px] p-8">
      <div className="flex items-center gap-3">
        <Gauge className="h-7 w-7 cf-accent-text" />

        <h2 className="text-3xl font-black">Simulation Defaults</h2>
      </div>

      <p className="mt-3 text-muted-foreground">
        Every new simulation starts with these values.
      </p>

      <div className="mt-10 grid gap-6">
        {/* METHOD */}

        <div>
          <label className="mb-2 block text-sm font-medium">HTTP Method</label>

          <select
            value={simulation.method}
            onChange={(e) => updateField("method", e.target.value)}
            className={inputClass}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
        </div>

        {/* URL */}

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Globe size={16} />
            Target URL
          </label>

          <input
            value={simulation.url}
            onChange={(e) => updateField("url", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* CONTENT TYPE */}

        <div>
          <label className="mb-2 block text-sm font-medium">Content Type</label>

          <input
            value={simulation.contentType}
            onChange={(e) => updateField("contentType", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* AUTH */}

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Lock size={16} />
            Authorization Token
          </label>

          <input
            value={simulation.authToken}
            onChange={(e) => updateField("authToken", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* HEADERS */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Default Headers (JSON)
          </label>

          <textarea
            rows={5}
            value={headersDraft}
            onChange={(e) => setHeadersDraft(e.target.value)}
            onBlur={() => saveJsonField("headers", headersDraft)}
            className={inputClass}
          />
        </div>

        {/* PAYLOAD */}

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Send size={16} />
            Default Payload (JSON)
          </label>

          <textarea
            rows={7}
            value={payloadDraft}
            onChange={(e) => setPayloadDraft(e.target.value)}
            onBlur={() => saveJsonField("payload", payloadDraft)}
            className={inputClass}
          />
        </div>

        {jsonError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {jsonError}
          </div>
        ) : null}

        {/* NUMBERS */}

        <div className="grid gap-6 md:grid-cols-2">
          <NumberField
            label="Requests / Second"
            value={simulation.rps}
            onChange={(v) => updateField("rps", v)}
          />

          <NumberField
            label="Duration"
            value={simulation.duration}
            onChange={(v) => updateField("duration", v)}
          />

          <NumberField
            label="Concurrency"
            value={simulation.concurrency}
            onChange={(v) => updateField("concurrency", v)}
          />

          <NumberField
            label="Total Requests"
            value={simulation.totalRequests}
            onChange={(v) => updateField("totalRequests", v)}
          />
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputClass}
      />
    </div>
  );
}
