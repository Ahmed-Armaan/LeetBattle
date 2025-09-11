package routes

import (
	"fmt"
)

type GameContext struct {
	RoomId        string
	Teams         [2][5]string
	PlayerStatus  [2][5]string
	Problems      string
	CurrPlayercnt int
	WinningTeam   int
}

const (
	NS = "not_submitted"
	SA = "solution_accepted"
	TU = "times_up"
)

func NewGameContext(roomId string) GameContext {
	GameContext := GameContext{}
	GameContext.RoomId = roomId
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
		fmt.Println(context.Problems)

		for i := range 2 {
			for j := range 5 {
				fmt.Printf("%s -> %s\n", context.Teams[i][j], context.PlayerStatus[i][j])
			}
		}

		if team1Done {
			context.WinningTeam = 1
		} else if team2Done {
			context.WinningTeam = 2
		}

		go Insert(&context)
	}
}
