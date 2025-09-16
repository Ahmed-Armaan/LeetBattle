import { useEffect, useState } from "react";

interface PlayerState {
  Player: string;
  State: string;
}

interface MatchHistory {
  match_id: string;
  team1_id: string;
  team2_id: string;
  problems_id: string;
  winner: number;
  problems: string[];
  team1: PlayerState[];
  team2: PlayerState[];
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (username: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data: MatchHistory[] = await res.json();

      // Optional: log to check data
      console.log("Fetched match history:", data);

      setHistories(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionData = sessionStorage.getItem("leetcode-data");
    if (!sessionData) return;

    try {
      const parsed = JSON.parse(sessionData);
      const username = parsed.username;
      if (username) fetchHistory(username);
    } catch (err) {
      console.error("Invalid session storage data:", err);
    }
  }, []);

  return (
    <div className="p-8 mx-auto bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Player Match History</h1>

      {loading && <p>Loading...</p>}

      {!loading && histories.length === 0 && <p>No matches found.</p>}

      {histories.map((match) => (
        <div key={match.match_id} className="border rounded p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-2">
            Match {match.match_id} | Winner Team: {match.winner}
          </h2>

          <p className="mb-2">
            <strong>Problems:</strong> {match.problems.join(", ")}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Team 1</h3>
              <ul>
                {match.team1.map((p) => (
                  <li key={p.Player}>
                    {p.Player} - <span className="font-mono">{p.State}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Team 2</h3>
              <ul>
                {match.team2.map((p) => (
                  <li key={p.Player}>
                    {p.Player} - <span className="font-mono">{p.State}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
