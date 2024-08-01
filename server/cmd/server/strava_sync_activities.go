package main

import (
	"net/http"
)

func (app *application) stravaSyncActivitiesHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: implement fetching of strava data and storing in our db....

	w.Header().Set("Content-Type", "application/json")
	_, err := w.Write([]byte("Syncing activities..."))
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
