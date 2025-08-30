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
	LeaderKey string
	Teams     [2][5]*Player
	ch        chan string
	Mutex     sync.RWMutex
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
	rooms       = make(map[string]*Room)
	connRoomMap = make(map[*websocket.Conn]*Room)
	roomsMu     sync.RWMutex
	connMapmu   sync.RWMutex
)

const (
	JoinNotify   = "join_notify"
	StartGame    = "start_game"
	SendSolution = "send_solution"
	Forfiet      = "forfiet"
	Starting     = "starting"
	//SetTimer     = "set_timer"
	SwitchTeam = "switch_team"
	Exit       = "exit_room"
	Error      = "error"
	Test       = "test"
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
		fmt.Printf("\nsent a msg\n")
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
		fmt.Printf("Yo the room %s is gonr poof!!\n", wsReq.RoomId)
		wsReq.Payload = "room not found"
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

	foundRoom := false
	a, b := -1, -1
	for i := 0; i < 2 && !foundRoom; i++ {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				//Room.Teams[i][j] = &currPlayer
				a = i
				b = j
				foundRoom = true
			} else if Room.Teams[i][j].PlayerId == currPlayer.PlayerId {
				Room.Teams[i][j].Conn = conn
				connMapmu.Lock()
				connRoomMap[conn] = Room
				connMapmu.Unlock()
				return
			}
		}
	}

	if foundRoom {
		Room.Teams[a][b] = &currPlayer
		connMapmu.Lock()
		connRoomMap[conn] = Room
		connMapmu.Unlock()
	} else if !foundRoom {
		wsReq.Payload = "room already full"
		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		conn.WriteMessage(websocket.TextMessage, reqBuf.Bytes())
		return
	}

	//Room.Teams[Room.NextEmptyPlace[0]][Room.NextEmptyPlace[1]] = &currPlayer
	//switch Room.NextEmptyPlace {
	//case [2]int{1, 4}:
	//	Room.NextEmptyPlace = [2]int{-1, -1}
	//case [2]int{0, 4}:
	//	Room.NextEmptyPlace = [2]int{1, 0}
	//default:
	//	Room.NextEmptyPlace[1]++
	//}
	announceTeams(Room)
}

func announceTeams(Room *Room) {
	var team1, team2 []string
	fmt.Println("hello from announce Teams()")

	for i := range 2 {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				continue
			}
			switch i {
			case 0:
				team1 = append(team1, Room.Teams[i][j].PlayerId)
				fmt.Printf("team%d added: %s\n", 0, Room.Teams[i][j].PlayerId)
			case 1:
				team2 = append(team2, Room.Teams[i][j].PlayerId)
				fmt.Printf("team%d added: %s\n", 1, Room.Teams[i][j].PlayerId)
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
			removePlayerByConn(conn)
			break
		}
		fmt.Println(string(msg))
		var wsReq WsReqFormat
		_ = json.NewDecoder(strings.NewReader(string(msg))).Decode(&wsReq)
		wsReq.wsActions(conn)
	}
}

func removePlayerByConn(conn *websocket.Conn) *websocket.Conn {
	connMapmu.RLock()
	Room, ok := connRoomMap[conn]
	connMapmu.RUnlock()
	if !ok {
		fmt.Println("Invalid conn")
		return nil
	}

	var removedPlayerConn *websocket.Conn
	removedPlayerConn = nil
	for i := range 2 {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				continue
			}
			if conn == Room.Teams[i][j].Conn {
				removedPlayerConn = Room.Teams[i][j].Conn
				Room.Teams[i][j] = nil
				break
			}
		}
	}

	announceTeams(Room)
	return removedPlayerConn
}

func removePlayerById(roomId string, playerId string) *websocket.Conn {
	roomsMu.Lock()
	Room, ok := rooms[roomId]
	roomsMu.Unlock()

	if !ok {
		fmt.Println("Room Unavailable")
		return nil
	}

	var removedPlayerConn *websocket.Conn
	removedPlayerConn = nil
	for i := range 2 {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				continue
			}
			if playerId == Room.Teams[i][j].PlayerId {
				removedPlayerConn = Room.Teams[i][j].Conn
				Room.Teams[i][j] = nil
				break
			}
		}
	}

	announceTeams(Room)
	return removedPlayerConn
}

func switchTeam(roomId string, playerId string) {
	roomsMu.Lock()
	Room, ok := rooms[roomId]
	roomsMu.Unlock()

	if !ok {
		fmt.Println("Room Unavailable")
		return
	}

	currPosi, currPosj := -1, -1
	for i := 0; currPosi == -1 && currPosj == -1 && i < 2; i++ {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				continue
			}
			if Room.Teams[i][j].PlayerId == playerId {
				currPosi = i
				currPosj = j
				break
			}
		}
	}

	nextPosi := ((currPosi + 1) % 2)
	for j := 0; j < 5 && currPosi != -1 && currPosj != -1; j++ {
		if Room.Teams[nextPosi][j] == nil {
			Room.Teams[nextPosi][j] = Room.Teams[currPosi][currPosj]
			Room.Teams[currPosi][currPosj] = nil
			announceTeams(Room)
			break
		}
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
		payload := ""
		reqPayload, err := strconv.Atoi(wsReq.Payload)
		diff := reqPayload % 10
		time := reqPayload / 10

		//wsReq.Payload = ""
		//wsReq.Action = Starting
		//_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		//Room.ch <- reqBuf.String()
		//reqBuf.Reset()
		//fmt.Println("Sent starting res")

		if err != nil {
			payload = "Error!!"
		} else {
			problems, err := leetcodeapi.FetchProblems(diff, time)
			if err != nil {
				fmt.Println("Error!!")
			} else {
				payload = problems
			}
		}

		wsReq.Payload = payload
		_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		Room.ch <- reqBuf.String()

	case SwitchTeam:
		switchTeam(wsReq.RoomId, wsReq.Payload)

	case Exit:
		var removed *websocket.Conn
		removed = nil
		if wsReq.Payload == "" {
			removed = removePlayerByConn(conn)
		} else {
			removed = removePlayerById(wsReq.RoomId, wsReq.Payload)
		}

		if removed != nil {
			wsReq.Payload = ""
			_ = json.NewEncoder(&reqBuf).Encode(wsReq)
			removed.WriteMessage(websocket.TextMessage, reqBuf.Bytes())
		}
		//	fmt.Printf("maybe removed %s, its time to let them know\n", removed)
		//	var reqBuf bytes.Buffer
		//	fmt.Println("1")
		//	wsReq.Payload = removed
		//	fmt.Println("2")
		//	_ = json.NewEncoder(&reqBuf).Encode(wsReq)
		//	fmt.Println("3")
		//	Room.ch <- reqBuf.String()
	}
}
