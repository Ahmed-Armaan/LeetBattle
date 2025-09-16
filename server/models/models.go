package models

import ()

type GameContext struct {
	RoomId        string
	Teams         [2][5]string
	PlayerStatus  [2][5]string
	Problems      string
	CurrPlayercnt int
	WinningTeam   int
}
