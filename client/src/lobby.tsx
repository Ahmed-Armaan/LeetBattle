import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
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
import { receiveWsResFactory } from "./utils/wshandler";
import { UseTimer } from "./context/TimerContext";
import { UseGameState } from "./context/GameState";

interface Teams {
  team1: string[];
  team2: string[];
}

//interface Problems {
//  problemSlug: string[];
//}
//
//interface ProblemContentreq {
//  slug: string;
//}

export interface CodeSnippet {
  lang: string;
  langSlug: string;
  code: string;
}

export interface ProblemContentRes {
  title: string;
  content: string;
  QuestionId: string;
  codeSnippets: CodeSnippet[];
}

function Lobby() {
  const navigate = useNavigate();
  const { roomId, playerId } = useParams();
  const { setwsContext } = useWs();
  const { team1, team2, setteam1context, setteam2context, setTeam1Scores, setTeam2Scores } = UseTeams();
  const { time, setTime } = UseTimer();
  const { setRunning, setWinningTeam } = UseGameState();
  //  const { title, description, setTitileContext, setDescriptionContext } = UseProblem();
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

    const receiveWsRes = receiveWsResFactory({
      setteam1context,
      setteam2context,
      setTeam1Scores,
      setTeam2Scores,
      toggleLoading,
      setTime,
      //time,
      currTeamsRef,
      usernameRef,
      navigate,
      //setRunning,
      //setWinningTeam,
    });

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
