import { useLocation } from "react-router-dom"; // also fix import here
import { useWs } from "./context/wsContext";
import { WsActions, makeWsActionReq } from "./utils/wsActionReq";
import { useEffect } from "react";

function PlayGround() {
  const location = useLocation();
  const { wsContextVal, setwsContext } = useWs();
  const ss = sessionStorage.getItem("roomData");

  const state = location.state as {
    time: number;
    difficulty: number;
  };

  useEffect(() => {
    if (!ss) return;

    try {
      const parsed = JSON.parse(ss);
      const roomId = parsed.roomId;
      if (roomId) {
        makeWsActionReq(WsActions.StartGame, roomId, state.difficulty.toString(), wsContextVal);
      }
    } catch (e) {
      console.error("Invalid session storage format:", e);
    }
  }, [wsContextVal]);

  return (
    <>
      <div>The Playground</div>
    </>
  );
}

export default PlayGround;
