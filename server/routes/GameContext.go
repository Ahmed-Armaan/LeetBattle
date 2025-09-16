package routes

import (
	"github.com/Ahmed-Armaan/LeetBattle/dbInterraction"
	"github.com/Ahmed-Armaan/LeetBattle/models"
)

const (
	NS = "not_submitted"
	SA = "solution_accepted"
	TU = "times_up"
)

func NewGameContext(roomId string) models.GameContext {
	GameContext := models.GameContext{}
	GameContext.RoomId = roomId
	return GameContext
}

func CheckGameState(context models.GameContext) {
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
		if team1Done {
			context.WinningTeam = 1
		} else if team2Done {
			context.WinningTeam = 2
		}

		go dbinterraction.Insert(&context)
	}
}
