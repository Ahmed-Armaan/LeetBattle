package routes

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Room struct {
	LeaderKey string
	Teams     [2][5]*Player
	Mutex     sync.RWMutex
}

type Player struct {
	Conn *websocket.Conn
	Room string
	Team int
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

	handleWSActions(conn)
}

func handleWSActions(conn *websocket.Conn) {}
