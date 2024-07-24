package server

import (
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/mguida22/strava-routes/server/internal/util"
)

func getSimplifiedActivity(activityID string) ([]byte, error) {
	// load the file and simplify the geojson
	fp := "data/activities/" + activityID + ".json"
	data, err := os.ReadFile(fp)
	if err != nil {
		return nil, err
	}

	// simplify the geojson data
	lineString, err := util.PointsToSimplifiedLineStringJSON(data)
	if err != nil {
		return nil, err
	}

	return lineString, nil
}

func activityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	activityID := vars["activityId"]

	simplified, err := getSimplifiedActivity(activityID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(simplified)
}
