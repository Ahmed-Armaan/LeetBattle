package main

import (
	"fmt"
	"github.com/Ahmed-Armaan/LeetBattle/routes"
	"net/http"
)

func main() {
	mux := routes.RegisterRoutes()
	fmt.Println("Server running at 8080")
	http.ListenAndServe(":8080", mux)
}
