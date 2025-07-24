import { createContext, useContext, useState, type ReactNode } from "react";

interface TeamsContextType {
  team1: number[];
  team2: number[];
  setteam1context: (team: number[]) => void;
  setteam2context: (team: number[]) => void;
}

const TeamContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamContextProvider({ children }: { children: ReactNode }) {
  const [team1, setTeam1] = useState<number[]>([]);
  const [team2, setTeam2] = useState<number[]>([]);

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

export function GetTeams() {
  const currTeamContext = useContext(TeamContext);
  if (!currTeamContext) throw new Error("useWs must be used within a WsContextProvider");
  return currTeamContext;
}
