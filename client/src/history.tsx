import { useEffect, useState } from "react";

type PlayerState = {
  Player: string;
  State: string;
};

type MatchHistory = {
  MatchID: string;
  Team1ID: string;
  Team2ID: string;
  ProblemsID: string;
  Winner: number;
  Problems: string[];
  Team1: PlayerState[];
  Team2: PlayerState[];
};

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
      const data = await res.json();
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
        <div key={match.MatchID} className="border rounded p-4 mb-4 shadow-sm">
          <h2 className="font-bold mb-2">
            Match {match.MatchID} | Winner Team: {match.Winner}
          </h2>

          <p className="mb-2">
            <strong>Problems:</strong> {match.Problems.join(", ")}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Team 1</h3>
              <ul>
                {match.Team1.map((p) => (
                  <li key={p.Player}>
                    {p.Player} - <span className="font-mono">{p.State}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Team 2</h3>
              <ul>
                {match.Team2.map((p) => (
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
