import { createContext, useContext, useState, type ReactNode } from "react";

interface WsContextType {
  wsContextVal: WebSocket | null;
  setwsContext: (ws: WebSocket | null) => void;
}

const wsContext = createContext<WsContextType | undefined>(undefined);

export function WsContextProvider({ children }: { children: ReactNode }) {
  const [wsContextValue, setWsContext] = useState<WebSocket | null>(null);

  return (
    <wsContext.Provider value={{
      wsContextVal: wsContextValue,
      setwsContext: setWsContext
    }}>
      {children}
    </wsContext.Provider>
  )
}

export function useWs() {
  const currWsContext = useContext(wsContext);
  if (!currWsContext) throw new Error("useWs must be used within a WsContextProvider");
  return currWsContext;
}
