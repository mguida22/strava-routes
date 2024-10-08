package main

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mguida22/strava-routes/server/internal/database"
	"github.com/mguida22/strava-routes/server/jsonlog"
)

type config struct {
	port int
	env  string
}

type application struct {
	config config
	models database.Models
	logger *jsonlog.Logger
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	logger := jsonlog.New(os.Stdout, jsonlog.LevelInfo)

	ctx, cancel := context.WithTimeout(context.Background(), database.DatabaseTimeout)
	defer cancel()

	client, err := database.New()
	if err != nil {
		logger.PrintFatal(err, nil)
	}
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			panic(err)
		}
	}()

	db := client.Database("strava-routes")
	logger.PrintInfo(("Connected to database"), nil)

	app := &application{
		config: config{
			port: 8080,
			env:  "development",
		},
		models: database.NewModels(db),
		logger: logger,
	}

	err = app.serve()
	if err != nil {
		logger.PrintFatal(err, nil)
		return
	}
}
