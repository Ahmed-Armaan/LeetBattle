package dbinterraction

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type PlayerState struct {
	Player string
	State  string
}

type MatchHistory struct {
	MatchID    string `json:"match_id"`
	Team1ID    string `json:"team1_id"`
	Team2ID    string `json:"team2_id"`
	ProblemsID string `json:"problems_id"`
	Winner     int    `json:"winner"`
	Prob1      string `json:"prob1"`
	Prob2      string `json:"prob2"`
	Prob3      string `json:"prob3"`
	Prob4      string `json:"prob4"`
	Prob5      string `json:"prob5"`
	T1P1       string `json:"t1p1"`
	T1S1       string `json:"t1s1"`
	T1P2       string `json:"t1p2"`
	T1S2       string `json:"t1s2"`
	T1P3       string `json:"t1p3"`
	T1S3       string `json:"t1s3"`
	T1P4       string `json:"t1p4"`
	T1S4       string `json:"t1s4"`
	T1P5       string `json:"t1p5"`
	T1S5       string `json:"t1s5"`
	T2P1       string `json:"t2p1"`
	T2S1       string `json:"t2s1"`
	T2P2       string `json:"t2p2"`
	T2S2       string `json:"t2s2"`
	T2P3       string `json:"t2p3"`
	T2S3       string `json:"t2s3"`
	T2P4       string `json:"t2p4"`
	T2S4       string `json:"t2s4"`
	T2P5       string `json:"t2p5"`
	T2S5       string `json:"t2s5"`
}

type matchHistoryRes struct {
	MatchID    string        `json:"match_id"`
	Team1ID    string        `json:"team1_id"`
	Team2ID    string        `json:"team2_id"`
	ProblemsID string        `json:"problems_id"`
	Winner     int           `json:"winner"`
	Problems   []string      `json:"problems"`
	Team1      []PlayerState `json:"team1"`
	Team2      []PlayerState `json:"team2"`
}

func History(username string) ([]matchHistoryRes, error) {
	projectRef := os.Getenv("SUPABASE_API_URL")
	apiKey := os.Getenv("SUPABASE_KEY")
	client := &http.Client{}

	jsonBody := []byte(fmt.Sprintf(`{"p_username":"%s"}`, username))
	url := fmt.Sprintf("%s/rest/v1/rpc/get_match_history", projectRef)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("supabase error: %s", string(bodyBytes))
	}

	var matchHistory []MatchHistory
	if err := json.Unmarshal(bodyBytes, &matchHistory); err != nil {
		return nil, fmt.Errorf("failed to decode match history: %w", err)
	}

	return transformMatchHistory(matchHistory), nil
}

func transformMatchHistory(ms []MatchHistory) []matchHistoryRes {
	res := make([]matchHistoryRes, len(ms))
	for i, m := range ms {
		res[i] = matchHistoryRes{
			MatchID:    m.MatchID,
			Team1ID:    m.Team1ID,
			Team2ID:    m.Team2ID,
			ProblemsID: m.ProblemsID,
			Winner:     m.Winner,
			Problems: []string{
				m.Prob1, m.Prob2, m.Prob3, m.Prob4, m.Prob5,
			},
			Team1: []PlayerState{
				{Player: m.T1P1, State: m.T1S1},
				{Player: m.T1P2, State: m.T1S2},
				{Player: m.T1P3, State: m.T1S3},
				{Player: m.T1P4, State: m.T1S4},
				{Player: m.T1P5, State: m.T1S5},
			},
			Team2: []PlayerState{
				{Player: m.T2P1, State: m.T2S1},
				{Player: m.T2P2, State: m.T2S2},
				{Player: m.T2P3, State: m.T2S3},
				{Player: m.T2P4, State: m.T2S4},
				{Player: m.T2P5, State: m.T2S5},
			},
		}
	}
	return res
}
