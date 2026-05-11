"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ProjectContext =
  createContext(null);

export function ProjectProvider({
  children,
}) {
  const [
    projectId,
    setProjectId,
  ] = useState(null);

  useEffect(() => {
    const stored =
      localStorage.getItem(
        "projectId",
      );

    if (stored) {
      setProjectId(stored);
    }
  }, []);

  const updateProject =
    (id) => {
      setProjectId(id);

      localStorage.setItem(
        "projectId",
        id,
      );
    };

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        setProjectId:
          updateProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(
    ProjectContext,
  );
}