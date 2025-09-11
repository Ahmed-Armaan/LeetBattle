package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

	"github.com/Ahmed-Armaan/LeetBattle/utils"
	_ "github.com/go-sql-driver/mysql"
)

type ProblemData struct {
	ProblemSlug []string `json:"problemSlug"`
}

func connect() *sql.DB {
	dsn := "root:104050@tcp(127.0.0.1:3306)/Leet_Battle"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("DB connection error:", err)
	}

	return db
}

func Insert(context *GameContext) {
	db := connect()
	defer db.Close()

	team1Id := utils.Random(8)
	team2Id := utils.Random(8)
	problemsId := utils.Random(8)
	fmt.Println("LOLKUHVHGB UYFTY")
	fmt.Println(context.Problems)

	var pd ProblemData
	err := json.Unmarshal([]byte(context.Problems), &pd)
	if err != nil {
		log.Println("Failed to unmarshal problems:", err)
		return
	}

	problemQuery := `
	INSERT INTO Problems (problems_id, p1, p2, p3, p4, p5)
	VALUES (?, ?, ?, ?, ?, ?)`
	_, err = db.Exec(problemQuery,
		problemsId,
		pd.ProblemSlug[0], pd.ProblemSlug[1], pd.ProblemSlug[2],
		pd.ProblemSlug[3], pd.ProblemSlug[4],
	)
	if err != nil {
		log.Println("Problem insert failed:", err)
		return
	}

	teamQuery := `
	INSERT INTO Teams (team_id, p1, p2, p3, p4, p5, state1, state2, state3, state4, state5)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err = db.Exec(teamQuery,
		team1Id,
		context.Teams[0][0], context.Teams[0][1], context.Teams[0][2], context.Teams[0][3], context.Teams[0][4],
		context.PlayerStatus[0][0], context.PlayerStatus[0][1], context.PlayerStatus[0][2], context.PlayerStatus[0][3], context.PlayerStatus[0][4],
	)
	if err != nil {
		log.Println("Team1 insert failed:", err)
		return
	}

	_, err = db.Exec(teamQuery,
		team2Id,
		context.Teams[1][0], context.Teams[1][1], context.Teams[1][2], context.Teams[1][3], context.Teams[1][4],
		context.PlayerStatus[1][0], context.PlayerStatus[1][1], context.PlayerStatus[1][2], context.PlayerStatus[1][3], context.PlayerStatus[1][4],
	)
	if err != nil {
		log.Println("Team2 insert failed:", err)
		return
	}

	matchQuery := `
	INSERT INTO Matches (match_id, team1_id, team2_id, problems_id, winner)
	VALUES (?, ?, ?, ?, ?)`
	_, err = db.Exec(matchQuery, context.RoomId, team1Id, team2Id, problemsId, context.WinningTeam)
	if err != nil {
		log.Println("Match insert failed:", err)
		return
	}

	playerQuery := `INSERT INTO Players (username, match_id) VALUES (?, ?)`
	for teamIdx := 0; teamIdx < 2; teamIdx++ {
		for i := 0; i < 5; i++ {
			_, err = db.Exec(playerQuery, context.Teams[teamIdx][i], context.RoomId)
			if err != nil {
				log.Println("Player insert failed:", err)
				return
			}
		}
	}

	log.Println("Inserted match", context.RoomId)
}
