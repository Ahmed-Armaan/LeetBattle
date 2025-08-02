import { useState } from "react";
import './tailwind.css'

function GameControlBar({ leader }: { leader: boolean }) {
  const [gameDuration, setGameDuration] = useState(15);
  const [gameDifficulty, setGameDifficulty] = useState("Medium");
  const [dropDownState, toggleDropDown] = useState(false);

  const difficultyOptions = ["Easy", "Medium", "Hard"];

  return (
    <>
      <div className="flex flex-row bg-gray-800 text-white p-4 text-[20px] justify-between items-start w-full relative">

        {leader &&
          <div className="flex flex-row items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span>Game duration: {gameDuration} Min</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setGameDuration(gameDuration + 5)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >+</button>
                <button
                  onClick={() => gameDuration > 5 && setGameDuration(gameDuration - 5)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >-</button>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => toggleDropDown(!dropDownState)}
                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                Game Difficulty: {gameDifficulty}
              </button>

              <ul className={`absolute bottom-full right-0 mb-1 bg-gray-700 rounded shadow ${dropDownState ? "visible" : "invisible"}`}>
                {difficultyOptions.map((value, id) => (
                  <li key={id}>
                    <button
                      onClick={() => {
                        setGameDifficulty(value);
                        toggleDropDown(false);
                      }}
                      className="block px-4 py-2 hover:bg-gray-600 w-full text-left"
                    >
                      {value}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }

        <div className="flex items-start">
          <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">{leader ? "Start" : "Leave"}</button>
        </div>
      </div >
    </>
  )
}

export default GameControlBar;
