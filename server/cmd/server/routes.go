package main

import (
	"github.com/gorilla/mux"
)

func (app *application) routes() *mux.Router {
	r := mux.NewRouter()

	r.Use(loggingMiddleware)

	r.HandleFunc("/health", app.healthHandler).Methods("GET")

	r.HandleFunc("/strava/token-exchange", app.stravaTokenExchangeHandler).Methods("POST")

	r.HandleFunc("/{userId}/activities", app.activitiesHandler).Methods("GET")
	r.HandleFunc("/{userId}/activities/{activityId}", app.activityHandler).Methods("GET")
	r.HandleFunc("/{userId}/sync-activities", app.stravaSyncActivitiesHandler).Methods("GET")

	return r
}
