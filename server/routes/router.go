package routes

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Ahmed-Armaan/LeetBattle/leetcode_api"
	"github.com/Ahmed-Armaan/LeetBattle/utils"
)

type joinReq struct {
	RoomId string `json:"roomId"`
}

type problemReq struct {
	Slug string `json:"slug"`
}

func RegisterRoutes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/ping", ping)
	mux.HandleFunc("/login", login)
	mux.HandleFunc("/create", createRoom)
	mux.HandleFunc("/join", joinRoom)
	mux.HandleFunc("/ws", WSHandler)
	mux.HandleFunc("/getContent", getProblemContent)
	mux.HandleFunc("/submit", submit)
	handler := corsMiddleware(mux)

	return handler
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func ping(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Pong"})
}

func login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()

	username, status := leetcodeapi.GetUser(r.Body, r.UserAgent()) //username may hold username(if found) or message(if ISE)
	switch status {
	case http.StatusBadRequest:
		http.Error(w, "Error: bad request or invalid structure", http.StatusBadRequest)
		return

	case http.StatusOK:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"username": username,
		})
		return

	case http.StatusNotFound:
		w.WriteHeader(http.StatusNotFound)
		return

	default:
		http.Error(w, username, http.StatusInternalServerError)
	}
}

func createRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	roomId := utils.Random(12)
	leaderKey := utils.Random(12)
	if roomId == nil || leaderKey == nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	roomsMu.Lock()
	rooms[string(roomId)] = &Room{
		LeaderKey: string(leaderKey),
		Teams:     [2][5]*Player{},
		ch:        make(chan string),
	}
	new_room := rooms[string(roomId)]
	roomsMu.Unlock()

	resBody := map[string]string{
		"roomId":    string(roomId),
		"leaderKey": string(leaderKey),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resBody)

	go roomBroadcaster(new_room)
	go func() {
		time.Sleep(60 * time.Second)
		roomsMu.Lock()
		room, exits := rooms[string(roomId)]
		if !exits {
			return
		}

		isRoomEmpty := true
		for i := range 2 {
			for j := range 5 {
				if room.Teams[i][j] != nil {
					isRoomEmpty = false
					break
				}
			}
			if !isRoomEmpty {
				break
			}
		}

		if isRoomEmpty {
			delete(rooms, string(roomId))
		}

		roomsMu.Unlock()
	}()
}

func joinRoom(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()

	var req joinReq
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusInternalServerError)
		return
	}

	roomsMu.Lock()
	defer roomsMu.Unlock()

	room, ok := rooms[req.RoomId]
	if !ok {
		http.Error(w, "Invalid room id", http.StatusBadRequest)
		return
	}

	if room.isRoomFull() {
		http.Error(w, "Room already full", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"join":"proceed"}`))
}

func getProblemContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()

	var req problemReq
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	problem, err := leetcodeapi.FetchContent(req.Slug)
	if err != nil {
		http.Error(w, "Problem cannot be fetched", http.StatusInternalServerError)
		return
	}

	jsonBytes, err := json.Marshal(problem)
	if err != nil {
		http.Error(w, "Failed to encode problem data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonBytes)
}

func submit(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()

	var data leetcodeapi.SubmissionData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
	}

	submitStatus, err := leetcodeapi.Submit(data, r.UserAgent())
	if err != nil {
		http.Error(w, "Could not submit solution", http.StatusInternalServerError)
	}

	jsonBytes, err := json.Marshal(submitStatus)
	if err != nil {
		http.Error(w, "Received response improper", http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonBytes)
}

func (Room *Room) isRoomFull() bool {
	for i := range 2 {
		for j := range 5 {
			if Room.Teams[i][j] == nil {
				return false
			}
		}
	}

	return true
}
