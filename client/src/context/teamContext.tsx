import { createContext, useContext, useState, type ReactNode } from "react";

interface TeamsContextType {
  team1: string[];
  team2: string[];
  team1ScoresLeft: number;
  team2ScoresLeft: number;
  setteam1context: (team: string[]) => void;
  setteam2context: (team: string[]) => void;
  setTeam1Scores: (score: number) => void;
  setTeam2Scores: (score: number) => void;
}

const TeamContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamContextProvider({ children }: { children: ReactNode }) {
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [team1ScoresLeft, setTeam1Scores] = useState(0);
  const [team2ScoresLeft, setTeam2Scores] = useState(0);

  return (
    <TeamContext.Provider value={{
      team1: team1,
      team2: team2,
      team1ScoresLeft: team1ScoresLeft,
      team2ScoresLeft: team2ScoresLeft,
      setteam1context: setTeam1,
      setteam2context: setTeam2,
      setTeam1Scores: setTeam1Scores,
      setTeam2Scores: setTeam2Scores,
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
