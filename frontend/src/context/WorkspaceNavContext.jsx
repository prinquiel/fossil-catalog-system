import { createContext, useContext, useMemo } from 'react';

function join(base, path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

const defaultValue = {
  explorerBase: '/explorer',
  researcherBase: '/researcher',
  exp: (path) => join('/explorer', path),
  res: (path) => join('/researcher', path),
};

const WorkspaceNavContext = createContext(defaultValue);

/**
 * @param {{ explorerBase: string; researcherBase: string; children: import('react').ReactNode }} props
 */
export function WorkspaceNavProvider({ explorerBase, researcherBase, children }) {
  const value = useMemo(
    () => ({
      explorerBase,
      researcherBase,
      exp: (path) => join(explorerBase, path),
      res: (path) => join(researcherBase, path),
    }),
    [explorerBase, researcherBase]
  );
  return <WorkspaceNavContext.Provider value={value}>{children}</WorkspaceNavContext.Provider>;
}

export function useWorkspaceNav() {
  return useContext(WorkspaceNavContext);
}
