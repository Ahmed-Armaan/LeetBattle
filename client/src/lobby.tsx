import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useWs } from "./context/wsContext";
import { UseTeams } from "./context/teamContext";
import { UseProblem } from "./context/problemContext";
import { makeWsActionReq, WsActions } from "./utils/wsActionReq";
import type { WsActionsReq } from "./utils/wsActionReq";
import Navbar from "./navbar";
import GameConrolBar from "./gamecontrolbar";
import TeamCard from "./teamCard";
import Loading from "./loading";
import "./tailwind.css";

interface Teams {
  team1: string[];
  team2: string[];
}

interface Problems {
  problemSlug: string[];
}

function Lobby() {
  const { roomId, playerId } = useParams();
  const { setwsContext } = useWs();
  const { team1, team2, setteam1context, setteam2context } = UseTeams();
  const { title, description, setTitileContext, setDescriptionContext } = UseProblem();
  const [username, setUsername] = useState("");
  const [isLeader, setLeader] = useState(false);
  const [currTeams, setCurrTeams] = useState<Teams>({ team1, team2 });
  const [isLoading, toggleLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const currTeamsRef = useRef(currTeams);
  const usernameRef = useRef(username);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    setCurrTeams({ team1, team2 });
  }, [team1, team2]);

  useEffect(() => {
    currTeamsRef.current = currTeams;
    console.log("currTeams changed:", currTeams);
  }, [currTeams]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?room=${roomId}&player=${playerId}`);
    wsRef.current = ws;
    setwsContext(ws);

    ws.onopen = () => {
      if (playerId && roomId) {
        makeWsActionReq(WsActions.JoinNotify, roomId, playerId, ws);
      }
    };

    ws.onmessage = (msg) => {
      receiveWsRes(msg.data);
    };

    ws.onclose = () => {
      console.log("closed");
    };

    let ss = sessionStorage.getItem("roomData");
    if (ss) {
      setLeader(JSON.parse(ss).leader);
    }
    ss = sessionStorage.getItem("leetcode-data");
    if (ss) {
      setUsername(JSON.parse(ss).username);
    }
  }, []);

  const receiveWsRes = (msg: string) => {
    const wsReq: WsActionsReq = JSON.parse(msg);

    switch (wsReq.action) {
      case WsActions.JoinNotify: {
        const teamPayload: Teams = JSON.parse(wsReq.payload);
        setteam1context(teamPayload.team1);
        setteam2context(teamPayload.team2);
        break;
      }

      case WsActions.Test: {
        const testpayload: string = wsReq.payload;
        console.log(`test message : ${testpayload}`);
        break;
      }

      case WsActions.StartGame: {
        const problemspayload: Problems = JSON.parse(wsReq.payload);

        for (let i = 0; i < 5; i++) {
          console.log("Latest currTeams:", currTeamsRef.current);

          const p1 = currTeamsRef.current.team1?.[i];
          const p2 = currTeamsRef.current.team2?.[i];

          console.log(`team1: ${currTeamsRef.current.team1}`);
          console.log(`team2: ${currTeamsRef.current.team2}`);
          console.log(`${usernameRef.current}`);

          if (usernameRef.current === p1 || usernameRef.current === p2) {
            toggleLoading(!isLoading);
            console.log(problemspayload.problemSlug[i]);
            if (problemspayload) {
              console.log(`problem context: ${title}, ${description}`);
            } else {
              console.warn(`No problem found for index ${i}`);
            }
            break;
          }
        }
        break;
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar inLobby={true} roomId={roomId} />
      {!isLoading &&
        <>
          <div className="flex-1 bg-black flex flex-row p-2">
            <TeamCard team={team1} />
            <TeamCard team={team2} />
          </div>
          <GameConrolBar leader={isLeader} />
        </>
      }
      {isLoading &&
        <Loading />
      }
    </div>
  );
}

export default Lobby;
