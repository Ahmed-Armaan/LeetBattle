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
  const { roomId, username } = useParams();
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  const MakeWsActionReq = (action: string, payload: string) => {
    const wsActionReq: WsActionsReq = {
      action: action,
      payload: payload,
    }
    wsRef.current?.send(JSON.stringify(wsActionReq));
  }

  useEffect(() => {
    const ws = new WebSocket(`http://localhost:8080/${roomId}/${username}`);
    wsRef.current = ws;

    const navigateToRooms = () => { navigate("/rooms") };
    ws.onerror = () => navigateToRooms;
    ws.onclose = () => navigateToRooms;

    ws.onopen = () => {
      if (username) {
        MakeWsActionReq(WsActions.JoinNotify, username);
      }
    }
  }, []);


  return (
    <>
      <Navbar />
    </>
  )
}

export default Lobby;
