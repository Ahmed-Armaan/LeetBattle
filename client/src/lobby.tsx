import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router"
import { useWs } from "./context/wsContext";
import { UseTeams } from "./context/teamContext";
import { makeWsActionReq, WsActions } from "./utils/wsActionReq";
import type { WsActionsReq } from "./utils/wsActionReq";
import Navbar from "./navbar";
import GameConrolBar from "./gamecontrolbar";
import TeamCard from "./teamCard";
import './tailwind.css'

// ws requires a {action, payload} to interract
//interface WsActionsReq {
//  action: string,
//  payload: string,
//}

interface Teams {
  team1: string[],
  team2: string[],
}

//const WsActions = {
//  JoinNotify: "join_notify",
//  SendSolution: "send_solution",
//  Forfiet: "forfiet",
//}

function Lobby() {
  const { roomId, playerId } = useParams();
  const wsRef = useRef<WebSocket>(null);
  //const navigate = useNavigate();
  const { wsContextVal, setwsContext } = useWs();
  const { team1, team2, setteam1context, setteam2context } = UseTeams();
  const [teams, setTeams] = useState<Teams | undefined>(undefined);
  const [isLeader, setLeader] = useState(false);

  //  const makeWsActionReq = (action: string, payload: string, ws: WebSocket | null = wsRef.current) => {
  //    if (ws === null) return;
  //    const wsActionReq: WsActionsReq = {
  //      action: action,
  //      payload: payload,
  //    }
  //    ws.send(JSON.stringify(wsActionReq));
  //  }

  const receiveWsRes = (msg: string) => {
    var wsReq: WsActionsReq = JSON.parse(msg);

    switch (wsReq.action) {
      case WsActions.JoinNotify:
        var teamPayload: Teams = JSON.parse(wsReq.payload);
        setTeams(teamPayload);
        setteam1context(teamPayload.team1);
        setteam2context(teamPayload.team2);
        break;
      case WsActions.Test:
        var Testpayload: string = wsReq.payload;
        console.log(`test message : ${Testpayload}`);
        break;
      case WsActions.StartGame:
        var Testpayload: string = wsReq.payload;
        console.log(`problem List: ${Testpayload}`);
        break;
    }
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?room=${roomId}&player=${playerId}`);
    wsRef.current = ws;
    setwsContext(ws);

    // const navigateToRooms = () => { navigate("/rooms") };
    // ws.onerror = () => navigateToRooms();
    // ws.onclose = () => navigateToRooms();

    ws.onopen = () => {
      if (playerId && roomId) {
        makeWsActionReq(WsActions.JoinNotify, roomId, playerId, wsContextVal);
      }
    };

    ws.onmessage = (msg) => {
      receiveWsRes(msg.data)
    }

    ws.onclose = () => {
      console.log("closed")
    }

    var ss = sessionStorage.getItem("roomData");
    if (ss) {
      setLeader(JSON.parse(ss).leader);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar inLobby={true} roomId={roomId} />
      <div className="flex-1 bg-black flex flex-row p-2">
        <TeamCard team={teams?.team1} />
        <TeamCard team={teams?.team2} />
      </div>
      <GameConrolBar leader={isLeader} />
    </div>
  )
}

export default Lobby;
