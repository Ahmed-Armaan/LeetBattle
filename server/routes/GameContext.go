package routes

import (
	"encoding/json"
	"fmt"
)

type GameContext struct {
	roomId        string
	teams         [5][5]string
	PlayerStatus  [5][5]string
	problems      string
	currPlayercnt int
}

const (
	NS = "not_submitted"
	SA = "solution_accepted"
	TU = "times_up"
)

func NewGameContext(roomId string) GameContext {
	GameContext := GameContext{}
	GameContext.roomId = roomId
	return GameContext
}

func CheckGameState(context GameContext) {
	team1Done, team2Done := true, true

	for i := 0; i < 5 && (team1Done || team2Done); i++ {
		if context.PlayerStatus[0][i] == NS {
			team1Done = false
		}
		if context.PlayerStatus[1][i] == NS {
			team1Done = false
		}
	}

	if team1Done || team2Done {
		fmt.Println("HERRo")
		var problems map[string]any
		_ = json.Unmarshal([]byte(context.problems), &problems)
		fmt.Println(problems)
	}
}
