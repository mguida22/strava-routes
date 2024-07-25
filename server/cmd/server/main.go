package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/mguida22/strava-routes/server/internal/server"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	log.Println("Server started on port 8080")
	srv := server.HttpServer(":8080")
	log.Fatal(srv.ListenAndServe())
}
