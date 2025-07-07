package routes

import (
	"encoding/json"
	"net/http"

	"github.com/Ahmed-Armaan/LeetBattle/leetcode_api"
)

func RegisterRoutes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/login", login)
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
