package main

import (
	"log"

	"github.com/mguida22/strava-routes/server/internal/server"
)

func main() {
	log.Println("Server started on port 8080")
	srv := server.HttpServer(":8080")
	log.Fatal(srv.ListenAndServe())
}
