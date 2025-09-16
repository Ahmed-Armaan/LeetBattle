import { createContext, useContext, useState, type ReactNode } from "react";

interface GameStateContextType {
  running: boolean;
  setRunning: (state: boolean) => void;
  winningTeam: number;
  setWinningTeam: (team: number) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [winningTeam, setWinningTeam] = useState<number>(-1);
  const [running, setRunning] = useState<boolean>(true);

  return (
    <GameStateContext.Provider value={{
      running: running,
      setRunning: setRunning,
      winningTeam: winningTeam,
      setWinningTeam: setWinningTeam,
    }}>
      {children}
    </GameStateContext.Provider >
  )
}

export function UseGameState() {
  const currGameStateContext = useContext(GameStateContext);
  if (!currGameStateContext) throw new Error("UseTeams must be used within a TeamContextProvider");
  return currGameStateContext;
}
