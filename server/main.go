package main

import (
	"fmt"
	"github.com/Ahmed-Armaan/LeetBattle/routes"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	mux := routes.RegisterRoutes()
	fmt.Printf("Server running at %s", port)
	http.ListenAndServe(":"+port, mux)
}
