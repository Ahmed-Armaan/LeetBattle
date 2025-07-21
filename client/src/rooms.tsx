import { useEffect, useRef, useState } from 'react'
import Navbar from './navbar'
import './tailwind.css'
import { useNavigate } from 'react-router';

interface RoomData {
  roomId: string,
  leader: boolean,
  leaderKey: null | string,
}

function Rooms() {
  const [username, setUsername] = useState("");
  const [currFormState, changeFormState] = useState("default");
  const [roomCreationErr, createRoomCreationErr] = useState(false);
  const [roomJoinErr, createRoomJoinErr] = useState([false, ""]);
  const roomToJoin = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  //  useEffect(() => {
  //    const data = sessionStorage.getItem("leetcode-data");
  //    if (data) {
  //      const parsed = JSON.parse(data);
  //      if (parsed?.username) {
  //        setUsername(parsed.username);
  //      }
  //    }
  //  }, []);

  useEffect(() => {
    const uname = getUserName()
    if (uname !== "") {
      setUsername(uname);
    }
  })

  const getUserName = (): string => {
    const data = sessionStorage.getItem("leetcode-data");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed?.username) {
        return parsed.username
      }
    }
    return "";
  }

  const createRoomReq = async () => {
    try {
      const response = await fetch("http://localhost:8080/create", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Room Creation error");
      }

      const responseData = await response.json();
      if (!responseData?.roomId || !responseData?.leaderKey) {
        throw new Error("Room creation error")
      }

      const roomData: RoomData = {
        roomId: responseData.roomId,
        leader: true,
        leaderKey: responseData.leaderKey,
      };
      sessionStorage.setItem("roomData", JSON.stringify(roomData));
      navigate(`/lobby/${responseData.roomId}/${getUserName()}`)
    }
    catch {
      createRoomCreationErr(true)
    }
  }

  const joinRoomReq = async () => {
    const roomId = roomToJoin.current?.value;
    try {
      const response = await fetch("http://localhost:8080/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "roomId": roomId })
      });

      if (!response.ok) {
        if (response.status === 405 || response.status === 500) //status method not allowed or ISE
          throw new Error("An unexpected error occured");
        else if (response.status === 400) //status bad request
          throw new Error(await response.text());
        else
          throw new Error("request could not be made");
      }
      else {
        navigate(`/lobby/${roomId}/${getUserName()}`)
      }
    }
    catch (err) {
      if (err instanceof Error)
        createRoomJoinErr([true, (err.message)])
      else
        createRoomJoinErr([true, ("Unexpected Error occured")])
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">

          {(currFormState === "default") &&
            <>
              <h1 className="text-3xl font-bold text-center">Welcome {username}</h1>
              {(roomCreationErr) &&
                <p className="text-xl text-red-700 text-center">An error occured, room was not created.<br />Please try again.</p>
              }
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                onClick={() => { changeFormState("join") }}
              >
                Join A Room
              </button>
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                onClick={createRoomReq}
              >
                Create A Room
              </button>
            </>
          }

          {(currFormState === "join") &&
            <>
              {(roomJoinErr[0]) &&
                <p className="text-xl text-red-700 text-center">{roomJoinErr[1]}</p>
              }
              <input
                type="text"
                placeholder="Room ID"
                className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={roomToJoin}
              />
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                onClick={joinRoomReq}
              >
                Join
              </button>
              <button onClick={() => { changeFormState("default") }}>Back</button>
            </>
          }

        </div>
      </div>
    </>
  )
}

export default Rooms
