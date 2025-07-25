import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router"
import Navbar from "./navbar";
import { useWs } from "./context/wsContext";
import { UseTeams } from "./context/teamContext";

interface WsActionsReq {
  action: string,
  payload: string,
}

interface Teams {
  team1: string[],
  team2: string[],
}

const WsActions = {
  JoinNotify: "join_notify",
  SendSolution: "send_solution",
  Forfiet: "forfiet",
}

function TeamCard({ team }: { team: string[] | undefined }) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-md shadow-md w-1/2 m-2">
      <ul>
        {team?.map((player, idx) => (
          <li key={idx} className="text-2xl py-1 px-2 my-2 mx-2 border border-white rounded-md">
            {player}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lobby() {
  const { roomId, playerId } = useParams();
  const wsRef = useRef<WebSocket>(null);
  //const navigate = useNavigate();
  const { wsContextVal, setwsContext } = useWs();
  const { team1, team2, setteam1context, setteam2context } = UseTeams();
  const [teams, setTeams] = useState<Teams | undefined>(undefined);

  const makeWsActionReq = (action: string, payload: string, ws: WebSocket | null = wsRef.current) => {
    if (ws === null) return;
    const wsActionReq: WsActionsReq = {
      action: action,
      payload: payload,
    }
    ws.send(JSON.stringify(wsActionReq));
  }

  const receiveWsRes = (msg: string) => {
    var wsReq: WsActionsReq = JSON.parse(msg);

    switch (wsReq.action) {
      case WsActions.JoinNotify:
        var payload: Teams = JSON.parse(wsReq.payload);
        setTeams(payload);
        setteam1context(payload.team1);
        setteam2context(payload.team2);
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
      if (playerId) {
        makeWsActionReq(WsActions.JoinNotify, playerId, ws);
      }
    };

    ws.onmessage = (msg) => {
      receiveWsRes(msg.data)
    }

    ws.onclose = () => {
      console.log("closed")
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar inLobby={true} roomId={roomId} />
      <div className="flex-1 bg-black flex flex-row p-2">
        <TeamCard team={teams?.team1} />
        <TeamCard team={teams?.team2} />
      </div>
    </div>
  )
}

export default Lobby;
