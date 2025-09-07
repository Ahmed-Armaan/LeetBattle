import { useEffect, useState } from "react";
import { makeWsActionReq } from "./utils/wsActionReq";

function Timer({ time, toggleGameTimeState }: {
  time: number;
  toggleGameTimeState: React.Dispatch<React.SetStateAction<boolean>>;
}
) {
  const [minutes, setMinutes] = useState(time);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    //if (gameTimerUp) return;

    const interval = setInterval(() => {
      setSeconds((prevSec) => {
        if (prevSec === 0) {
          if (minutes === 0) {
            toggleGameTimeState(true);
            clearInterval(interval);
            return 0;
          } else {
            setMinutes((m) => m - 1);
            return 59;
          }
        } else {
          return prevSec - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes, toggleGameTimeState]);

  return (
    <>
      <span className="number-box">
        {minutes}
      </span>
      <span className="px-1">:</span>
      <span className="number-box">
        {seconds}
      </span>
    </>
  )
}

export default Timer;
