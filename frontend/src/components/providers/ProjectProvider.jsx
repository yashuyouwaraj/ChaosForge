"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  usePathname,
} from "next/navigation";

const ProjectContext =
  createContext(null);

export function ProjectProvider({
  children,
}) {
  const pathname = usePathname();
  const [
    projectId,
    setProjectId,
  ] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );
    const urlProjectId =
      params.get(
        "projectId",
      );
    const storedProjectId =
      localStorage.getItem(
        "projectId",
      );
    const nextProjectId =
      urlProjectId ||
      storedProjectId ||
      null;

    queueMicrotask(() => {
      setProjectId(
        (currentProjectId) =>
          currentProjectId ===
          nextProjectId
            ? currentProjectId
            : nextProjectId,
      );
    });

    if (urlProjectId) {
      localStorage.setItem(
        "projectId",
        urlProjectId,
      );
    }
  }, [pathname]);

  const updateProject =
    (id) => {
      setProjectId(id);

      if (!id) {
        localStorage.removeItem(
          "projectId",
        );
        return;
      }

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
