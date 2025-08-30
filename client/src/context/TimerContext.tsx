import { createContext, useContext, useState, type ReactNode } from "react";

interface TimerContextType {
  time: number;
  setTime: (time: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerContextProvider({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(0);

  return (
    <TimerContext.Provider value={{
      time: time,
      setTime: setTime,
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export function UseTimer() {
  const currTimerContext = useContext(TimerContext);
  if (!currTimerContext) throw new Error("UseProblem must be used within a ProblemContextProvider");
  return currTimerContext;
}
