package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mguida22/strava-routes/server/internal/database"
)

func (app *application) makeActivitiesResponseJSON(activities *[]database.Activity) ([]byte, error) {
	response := []activityResponse{}
	for _, activity := range *activities {
		response = append(response, app.makeActivityResponse(&activity))
	}

	return json.Marshal(response)
}

func (app *application) activitiesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, ok := vars["userId"]
	if !ok {
		http.Error(w, "missing userId", http.StatusBadRequest)
		return
	}

	activities, err := app.models.Activities.GetAll(userID)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := app.makeActivitiesResponseJSON(activities)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(resp)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
