import { useNavigate } from "react-router";

var messages: string[] = [
  "Your solution has been Accepted, Great Job!! Wait for the game to end",
  "Team1 has won",
  "Team2 has won",
  "Times Up!! Its a tie"
]

function EndScreen({ msgCode }: { msgCode: number }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="text-3xl font-bold text-white bg-black/60 px-6 py-4 rounded-xl shadow-lg">
        {messages[msgCode]}
        {
          msgCode !== 0 &&
          <div>
            <button onClick={() => {
              navigate("/rooms")
            }}>
              Back to Lobby
            </button>
          </div>
        }
      </div>
    </div>
  );
}

export default EndScreen;
