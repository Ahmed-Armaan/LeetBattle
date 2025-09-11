package routes

import (
	"log"

	_ "github.com/go-sql-driver/mysql"
)

type PlayerState struct {
	Player string
	State  string
}

type MatchHistory struct {
	MatchID    string
	Team1ID    string
	Team2ID    string
	ProblemsID string
	Winner     int

	Problems []string
	Team1    []PlayerState
	Team2    []PlayerState
}

func History(username string) []MatchHistory {
	db := connect()
	defer db.Close()

	query := `
	SELECT 
	    m.match_id,
	    m.team1_id,
	    m.team2_id,
	    m.problems_id,
	    m.winner,
	
	    pr.p1, pr.p2, pr.p3, pr.p4, pr.p5,
	    t1.p1, t1.state1, t1.p2, t1.state2, t1.p3, t1.state3, t1.p4, t1.state4, t1.p5, t1.state5,
	    t2.p1, t2.state1, t2.p2, t2.state2, t2.p3, t2.state3, t2.p4, t2.state4, t2.p5, t2.state5
	FROM Matches m
	JOIN Players pl ON pl.match_id = m.match_id
	JOIN Problems pr ON m.problems_id = pr.problems_id
	JOIN Teams t1 ON m.team1_id = t1.team_id
	JOIN Teams t2 ON m.team2_id = t2.team_id
	WHERE pl.username = ?
	ORDER BY m.match_id DESC
	LIMIT 10;`

	rows, err := db.Query(query, username)
	if err != nil {
		log.Fatal("Query error:", err)
	}
	defer rows.Close()

	var histories []MatchHistory

	for rows.Next() {
		var h MatchHistory
		h.Problems = make([]string, 5)
		h.Team1 = make([]PlayerState, 5)
		h.Team2 = make([]PlayerState, 5)

		err := rows.Scan(
			&h.MatchID, &h.Team1ID, &h.Team2ID, &h.ProblemsID, &h.Winner,
			&h.Problems[0], &h.Problems[1], &h.Problems[2], &h.Problems[3], &h.Problems[4],
			&h.Team1[0].Player, &h.Team1[0].State,
			&h.Team1[1].Player, &h.Team1[1].State,
			&h.Team1[2].Player, &h.Team1[2].State,
			&h.Team1[3].Player, &h.Team1[3].State,
			&h.Team1[4].Player, &h.Team1[4].State,
			&h.Team2[0].Player, &h.Team2[0].State,
			&h.Team2[1].Player, &h.Team2[1].State,
			&h.Team2[2].Player, &h.Team2[2].State,
			&h.Team2[3].Player, &h.Team2[3].State,
			&h.Team2[4].Player, &h.Team2[4].State,
		)
		if err != nil {
			log.Fatal("Scan error:", err)
		}

		histories = append(histories, h)
	}

	return histories
}
