package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"

	"github.com/Ahmed-Armaan/LeetBattle/leetcode_api"
	"github.com/gorilla/websocket"
)

type Room struct {
	LeaderKey      string
	NextEmptyPlace [2]int
	Teams          [2][5]*Player
	ch             chan string
	Mutex          sync.RWMutex
}

type Player struct {
	Conn     *websocket.Conn
	PlayerId string
	Room     string
}

type Teams struct {
	Team1 []string `json:"team1"`
	Team2 []string `json:"team2"`
}

type WsReqFormat struct {
	Action  string `json:"action"`
	RoomId  string `json:"roomid"`
	Payload string `json:"payload"`
}

type WsResFormat struct {
	Action  string `json:"action"`
	Payload string `json:"payload"`
	Error   string `json:"error"`
}

var (
	rooms   = make(map[string]*Room)
	roomsMu sync.RWMutex
)

const (
	JoinNotify   = "join_notify"
	StartGame    = "start_game"
	SendSolution = "send_solution"
	Forfiet      = "forfiet"
	Starting     = "starting"
	Error        = "error"
	Test         = "test"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WSHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		return
	}

	requestedRoom := r.URL.Query().Get("room")
	playerId := r.URL.Query().Get("player")
	handleJoin(conn, requestedRoom, playerId)
	wsReceiver(conn)
}

func roomBroadcaster(Room *Room) {
	for msg := range Room.ch {
		Room.Mutex.RLock()
		for i := range Room.Teams {
			for j := range Room.Teams[i] {
				player := Room.Teams[i][j]
				if player == nil {
					continue
				}
				_ = player.Conn.WriteMessage(websocket.TextMessage, []byte(msg))
			}
		}
		Room.Mutex.RUnlock()
	}
}

func handleJoin(conn *websocket.Conn, roomId string, playerId string) {
	roomsMu.Lock()
	Room, ok := rooms[roomId]
	roomsMu.Unlock()

	wsReq := &WsReqFormat{
		Action:  Error,
		RoomId:  "",
		Payload: "",
	}
	var reqBuf bytes.Buffer

	if !ok {
		wsReq.Payload = "room not found"
		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		conn.WriteMessage(websocket.TextMessage, reqBuf.Bytes())
		return
	} else if Room.NextEmptyPlace == [2]int{-1, -1} {
		wsReq.Payload = "room already full"
		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		conn.WriteMessage(websocket.TextMessage, reqBuf.Bytes())
		return
	}

	currPlayer := Player{
		Conn:     conn,
		PlayerId: playerId,
		Room:     roomId,
	}

	Room.Mutex.Lock()
	defer Room.Mutex.Unlock()
	Room.Teams[Room.NextEmptyPlace[0]][Room.NextEmptyPlace[1]] = &currPlayer

	switch Room.NextEmptyPlace {
	case [2]int{1, 4}:
		Room.NextEmptyPlace = [2]int{-1, -1}
	case [2]int{0, 4}:
		Room.NextEmptyPlace = [2]int{1, 0}
	default:
		Room.NextEmptyPlace[1]++
	}
	announceTeams(Room)
}

func announceTeams(Room *Room) {
	var team1, team2 []string

	for i := range 2 {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				break
			}
			switch i {
			case 0:
				team1 = append(team1, Room.Teams[i][j].PlayerId)
			case 1:
				team2 = append(team2, Room.Teams[i][j].PlayerId)
			}
		}
	}

	TeamData := &Teams{
		Team1: team1,
		Team2: team2,
	}

	var teamBuf bytes.Buffer
	_ = json.NewEncoder(&teamBuf).Encode(TeamData)

	wsReq := &WsReqFormat{
		Action:  JoinNotify,
		RoomId:  "",
		Payload: teamBuf.String(),
	}

	var reqBuf bytes.Buffer
	_ = json.NewEncoder(&reqBuf).Encode(wsReq)

	Room.ch <- reqBuf.String()
}

func wsReceiver(conn *websocket.Conn) {
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("read error:", err)
			break
		}
		fmt.Println(string(msg))
		var wsReq WsReqFormat
		_ = json.NewDecoder(strings.NewReader(string(msg))).Decode(&wsReq)
		wsReq.wsActions(conn)
	}
}

func (wsReq *WsReqFormat) wsActions(conn *websocket.Conn) {
	roomsMu.Lock()
	Room, ok := rooms[wsReq.RoomId]
	roomsMu.Unlock()
	if !ok {
		conn.WriteMessage(websocket.TextMessage, []byte("room not found"))
		return
	}

	Room.Mutex.Lock()
	defer Room.Mutex.Unlock()
	var reqBuf bytes.Buffer

	switch wsReq.Action {
	case Test:
		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		Room.ch <- reqBuf.String()

	case StartGame:
		diff, err := strconv.Atoi(wsReq.Payload)

		//		wsReq.Payload = ""
		//		wsReq.Action = Starting
		//		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		//		Room.ch <- reqBuf.String()

		problems, err := leetcodeapi.FetchProblems(diff)
		var payload string
		fmt.Println(payload)
		if err != nil {
			payload = "Error!!"
		} else {
			payload = problems
		}

		wsReq.Payload = payload
		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		Room.ch <- reqBuf.String()
	}
}
