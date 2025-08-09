import { createContext, useContext, useState, type ReactNode } from "react";

interface Problem {
  title: string;
  description: string;
  setTitileContext: (title: string) => void;
  setDescriptionContext: (desc: string) => void;
}

const ProblemContext = createContext<Problem | undefined>(undefined);

export function ProblemContextProvider({ children }: { children: ReactNode }) {
  const [title, setTitile] = useState<string>("");
  const [desc, setDescription] = useState<string>("");

  return (
    <ProblemContext.Provider value={{
      title: title,
      description: desc,
      setTitileContext: setTitile,
      setDescriptionContext: setDescription,
    }}>
      {children}
    </ProblemContext.Provider>
  )
}

export function UseProblem() {
  const currProblemContext = useContext(ProblemContext);
  if (!currProblemContext) throw new Error("UseProblem must be used within a ProblemContextProvider");
  return currProblemContext;
}
