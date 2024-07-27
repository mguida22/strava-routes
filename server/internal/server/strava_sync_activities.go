package server

import (
	"log"
	"net/http"
)

func stravaSyncActivitiesHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: implement fetching of strava data and storing in our db....

	w.Header().Set("Content-Type", "application/json")
	_, err := w.Write([]byte("Syncing activities..."))
	if err != nil {
		log.Printf("Error writing response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
