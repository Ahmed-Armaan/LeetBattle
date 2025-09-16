package dbinterraction

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"reflect"
	"sync"

	"github.com/Ahmed-Armaan/LeetBattle/leetcode_api"
	"github.com/Ahmed-Armaan/LeetBattle/models"
	"github.com/Ahmed-Armaan/LeetBattle/utils"
)

type TeamRow struct {
	Team_id string `json:"team_id"`
	P1      string `json:"p1"`
	P2      string `json:"p2"`
	P3      string `json:"p3"`
	P4      string `json:"p4"`
	P5      string `json:"p5"`
	State1  string `json:"state1"`
	State2  string `json:"state2"`
	State3  string `json:"state3"`
	State4  string `json:"state4"`
	State5  string `json:"state5"`
}

type ProblemRow struct {
	Problems_id string `json:"problems_id"`
	P1          string `json:"p1"`
	P2          string `json:"p2"`
	P3          string `json:"p3"`
	P4          string `json:"p4"`
	P5          string `json:"p5"`
}

type PlayerRow struct {
	Username string `json:"username"`
	Match_id string `json:"match_id"`
}

type MatchesRow struct {
	Match_id    string `json:"match_id"`
	Team1_id    string `json:"team1_id"`
	Team2_id    string `json:"team2_id"`
	Problems_id string `json:"problems_id"`
	Winner      int    `json:"winner"`
}

func Insert(game *models.GameContext) {
	var wg sync.WaitGroup
	team1Id := utils.Random(8)
	team2Id := utils.Random(8)
	problemsId := utils.Random(8)

	team1 := createTeamRow(string(team1Id), game.Teams[0], game.PlayerStatus[0])
	team2 := createTeamRow(string(team2Id), game.Teams[1], game.PlayerStatus[1])

	data1, _ := json.Marshal(team1)
	wg.Add(1)
	dbPost(data1, "Teams", &wg)

	data2, _ := json.Marshal(team2)
	wg.Add(1)
	dbPost(data2, "Teams", &wg)

	problemRow, err := createProblemRow(game.Problems, string(problemsId))
	if err != nil {
		fmt.Println("Could not create entry")
	}
	data3, _ := json.Marshal(problemRow)
	wg.Add(1)
	dbPost(data3, "Problems", &wg)

	for _, team := range game.Teams {
		for _, player := range team {
			if player != "" {
				playerRow := PlayerRow{
					Username: player,
					Match_id: game.RoomId,
				}
				data4, _ := json.Marshal(playerRow)
				wg.Add(1)
				dbPost(data4, "Players", &wg)
			}
		}
	}

	matchRow := MatchesRow{
		Match_id:    game.RoomId,
		Team1_id:    string(team1Id),
		Team2_id:    string(team2Id),
		Problems_id: string(problemsId),
		Winner:      game.WinningTeam,
	}
	data5, _ := json.Marshal(matchRow)
	wg.Add(1)
	dbPost(data5, "Matches", &wg)

	wg.Wait()
}

func dbPost(data []byte, table string, wg *sync.WaitGroup) {
	defer wg.Done()
	projectRef := os.Getenv("SUPABASE_API_URL")
	apiKey := os.Getenv("SUPABASE_KEY")

	url := fmt.Sprintf("%s/rest/v1/%s", projectRef, table)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(data))
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		fmt.Println("Error inserting into", table, ":", resp.Status)
		fmt.Println("Body:", string(body))
	}
}

func createTeamRow(id string, team [5]string, playerStatus [5]string) TeamRow {
	teamRow := TeamRow{Team_id: id}
	v := reflect.ValueOf(&teamRow).Elem()

	for i := range 5 {
		v.FieldByName(fmt.Sprintf("P%d", i+1)).SetString(team[i])
		v.FieldByName(fmt.Sprintf("State%d", i+1)).SetString(playerStatus[i])
	}

	return teamRow
}

func createProblemRow(problems string, problmesId string) (ProblemRow, error) {
	var pd leetcodeapi.Problems
	err := json.Unmarshal([]byte(problems), &pd)
	if err != nil {
		return ProblemRow{}, err
	}

	problemRow := ProblemRow{Problems_id: problmesId}
	v := reflect.ValueOf(&problemRow).Elem()

	for i := 0; i < len(pd.ProblemSlug) && i < 5; i++ {
		v.FieldByName(fmt.Sprintf("P%d", i+1)).SetString(pd.ProblemSlug[i])
	}

	return problemRow, nil
}
