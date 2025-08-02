import { createContext, useContext, useState, type ReactNode } from "react";

interface TeamsContextType {
  team1: string[];
  team2: string[];
  setteam1context: (team: string[]) => void;
  setteam2context: (team: string[]) => void;
}

const TeamContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamContextProvider({ children }: { children: ReactNode }) {
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);

  return (
    <TeamContext.Provider value={{
      team1: team1,
      team2: team2,
      setteam1context: setTeam1,
      setteam2context: setTeam2,
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export function UseTeams() {
  const currTeamContext = useContext(TeamContext);
  if (!currTeamContext) throw new Error("UseTeams must be used within a TeamContextProvider");
  return currTeamContext;
}
