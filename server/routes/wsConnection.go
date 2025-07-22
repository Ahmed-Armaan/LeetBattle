package routes

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

type Room struct {
	LeaderKey      string
	NextEmptyPlace [2]int
	Teams          [2][5]*Player
	Mutex          sync.RWMutex
}

type Player struct {
	Conn     *websocket.Conn
	PlayerId string
	Room     string
}

var (
	rooms   = make(map[string]*Room)
	roomsMu sync.RWMutex
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
	handleWSActions(conn)
}

func handleJoin(conn *websocket.Conn, roomId string, playerId string) {
	currPlayer := Player{
		Conn:     conn,
		PlayerId: playerId,
		Room:     roomId,
	}

	roomsMu.Lock()
	Room := rooms[roomId]
	roomsMu.Unlock()

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
}

func handleWSActions(conn *websocket.Conn) {
	defer conn.Close()
	message := "hello from server"
	_ = conn.WriteMessage(websocket.TextMessage, []byte(message))

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("read error:", err)
			break
		}
		fmt.Println(string(msg))
		_ = conn.WriteMessage(websocket.TextMessage, []byte(message))
	}
}
