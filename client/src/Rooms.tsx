import { useEffect, useState } from 'react'
import Navbar from './navbar'
import './tailwind.css'

function Rooms() {
  const [username, setUsername] = useState("");
  const [currFormState, changeFormState] = useState("default");

  useEffect(() => {
    const data = sessionStorage.getItem("leetcode-data");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed?.userImage) {
        setUsername(parsed.username);
      }
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">

          {(currFormState === "default") &&
            <>
              <h1 className="text-3xl font-bold text-center">Welcome {username}</h1>
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                onClick={() => { changeFormState("join") }}
              >
                Join A Room
              </button>
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
              >
                Create A Room
              </button>
            </>
          }

          {(currFormState === "join") &&
            <>
              <input
                type="text"
                placeholder="Room ID"
                className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
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
