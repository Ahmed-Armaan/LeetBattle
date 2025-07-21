import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router"
import Navbar from "./navbar";

interface WsActionsReq {
  action: string,
  payload: string,
}

const WsActions = {
  JoinNotify: "join_notify",
  SendSolution: "send_solution",
  Forfiet: "forfiet",
}

function Lobby() {
  const { roomId, playerId } = useParams();
  const wsRef = useRef<WebSocket>(null);
  const navigate = useNavigate();

  const MakeWsActionReq = (action: string, payload: string, ws: WebSocket | null = wsRef.current) => {
    if (ws === null) return;
    const wsActionReq: WsActionsReq = {
      action: action,
      payload: payload,
    }
    wsRef.current?.send(JSON.stringify(wsActionReq));
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?room=${roomId}&player=${playerId}`);
    wsRef.current = ws;

    const navigateToRooms = () => { navigate("/rooms") };
    ws.onerror = () => navigateToRooms();
    ws.onclose = () => navigateToRooms();

    ws.onopen = () => {
      if (playerId) {
        //      const wsActionReq: WsActionsReq = {
        //        action: WsActions.JoinNotify,
        //        payload: playerId,
        //      };
        //      ws.send(JSON.stringify(wsActionReq));
        MakeWsActionReq(WsActions.JoinNotify, playerId, ws);
      }
    };

    ws.onclose = () => {
      console.log("closed")
    }

    return () => {
      ws.close();
    };
  }, []);

  const test = () => {
    for (let i = 0; i < 4; i++) {
      wsRef.current?.send("testing");
    }
  }

  return (
    <>
      <Navbar />
      <h1>Lobby</h1>
      <button onClick={test}>hello</button>
    </>
  )
}

export default Lobby;
