"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createProject = async () => {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api("/projects", "POST", { name });
      const data = await api("/projects");
      setProjects(data);
      setName("");
    } catch (err) {
      setError(err.message || "Unable to create project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadProjects = async () => {
      const data = await api("/projects");

      if (!ignore) {
        setProjects(data);
      }
    };

    loadProjects();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">My Projects</h1>

      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 mr-2"
      />

      <button onClick={createProject} disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>

      {error ? <p className="mt-3 text-red-400">{error}</p> : null}

      <div className="mt-6">
        {projects.map((p, index) => {
          const projectId = p._id || p.id || `project-${index}`;

          return (
            <div
              key={projectId}
              className="p-4 bg-white/10 mb-2 cursor-pointer"
              onClick={() => {
                localStorage.setItem("projectId", projectId);
                window.location.href = "/";
              }}
            >
              {p.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
