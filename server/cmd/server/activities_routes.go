package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mguida22/strava-routes/server/internal/database"
)

type activityResponse struct {
	ID       int    `json:"id"`
	Polyline string `json:"polyline"`
}

func makeActivitiesResponseJSON(activities *[]database.Activity) ([]byte, error) {
	response := []activityResponse{}
	for _, activity := range *activities {
		// use the Polyline if available, otherwise use the SummaryPolyline
		polyline := activity.Polyline
		if polyline == "" {
			polyline = activity.SummaryPolyline
		}

		// only return activities with a polyline
		if polyline == "" {
			continue
		}

		response = append(response, activityResponse{
			ID:       activity.StravaID,
			Polyline: polyline,
		})
	}

	return json.Marshal(response)
}

func (app *application) activitiesRoutesHandler(w http.ResponseWriter, r *http.Request) {
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

	resp, err := makeActivitiesResponseJSON(activities)
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
