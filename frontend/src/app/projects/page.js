"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  const createProject = async () => {
    await api("/projects", "POST", { name });
    const data = await api("/projects");
    setProjects(data);
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

      <button onClick={createProject}>Create</button>

      <div className="mt-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-white/10 mb-2 cursor-pointer"
            onClick={() => {
              localStorage.setItem("projectId", p.id);
              window.location.href = "/";
            }}
          >
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
