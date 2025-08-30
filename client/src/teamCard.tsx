import { use, useEffect, useState } from "react";
import { useWs } from "./context/wsContext";
import "./tailwind.css";
import { FaExchangeAlt } from "react-icons/fa";
import { IoPersonRemoveSharp } from "react-icons/io5";
import { makeWsActionReq, WsActions } from "./utils/wsActionReq";

function TeamCard({ team }: { team: string[] | undefined }) {
  const [isLeader, setLeader] = useState(false);
  const [username, setUsername] = useState("");
  const { wsContextVal } = useWs();

  useEffect(() => {
    var ss = sessionStorage.getItem("roomData");
    if (ss && JSON.parse(ss).leader) {
      setLeader(true);
    }

    ss = sessionStorage.getItem("leetcode-data");
    if (ss && JSON.parse(ss).username) {
      setUsername(JSON.parse(ss).username);
    }
  })

  const switchTeam = (playerId: string) => {
    var ss = sessionStorage.getItem("roomData");
    if (ss) {
      var roomId = JSON.parse(ss).roomId;
      makeWsActionReq(WsActions.SwitchTeam, roomId, playerId, wsContextVal);
    }
  }

  const removePlayer = (playerId: string) => {
    var ss = sessionStorage.getItem("roomData");
    if (ss) {
      var roomId = JSON.parse(ss).roomId;
      makeWsActionReq(WsActions.Exit, roomId, playerId, wsContextVal);
    }
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-md shadow-md w-1/2 m-2">
      <ul>
        {team?.map((player, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between text-2xl py-1 px-2 my-2 mx-2 border border-white rounded-md"
          >
            <span>{player}</span>
            <div className="flex gap-2">
              {(player === username) &&
                <button className="bg-blue-600 px-2 py-1 rounded-md"
                  onClick={() => switchTeam(player)}
                ><FaExchangeAlt /></button>
              }
              {isLeader &&
                <button className="bg-red-600 px-2 py-1 rounded-md"
                  onClick={() => removePlayer(player)}
                ><IoPersonRemoveSharp /></button>
              }
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamCard;
