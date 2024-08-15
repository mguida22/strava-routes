package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	_ "time/tzdata"

	"github.com/gorilla/mux"
	"github.com/mguida22/strava-routes/server/internal/database"
	"go.mongodb.org/mongo-driver/mongo"
)

var stravaTimeFormat = "2006-01-02T15:04:05Z"

func startDateLocalToMS(startDateLocal string) (int64, error) {
	startTime, err := time.Parse(stravaTimeFormat, startDateLocal)
	if err != nil {
		return -1, err
	}

	return startTime.UnixMilli(), nil
}

func stripGMTOffset(tzString string) string {
	// strava gives us timezones like "(GMT-08:00) America/Los_Angeles"
	// but Go's time.LoadLocation expects just the IANA tz, "America/Los_Angeles"

	// Find the position of the closing parenthesis
	closeParen := strings.Index(tzString, ")")

	if closeParen == -1 {
		// If there's no closing parenthesis, return the original string
		return tzString
	}

	// Return the substring after ") ", trimming any leading spaces
	return strings.TrimSpace(tzString[closeParen+1:])
}

func startDateLocal(startDateLocal string, timezone string) (string, error) {
	loc, err := time.LoadLocation(stripGMTOffset(timezone))
	if err != nil {
		return "", err
	}

	startTime, err := time.ParseInLocation(stravaTimeFormat, startDateLocal, loc)
	if err != nil {
		return "", err
	}

	return startTime.Format(time.RFC3339), nil
}

type activityResponse struct {
	Distance       float64 `json:"distance"`
	ElapsedTime    int     `json:"elapsed_time"`
	ID             string  `json:"id"`
	MovingTime     int     `json:"moving_time"`
	Name           string  `json:"name"`
	Polyline       string  `json:"polyline"`
	SportType      string  `json:"sport_type"`
	StartDateLocal string  `json:"start_date_local"`
	StartDateMS    int64   `json:"start_date_ms"`
	StravaID       int     `json:"strava_id"`
}

func (app *application) makeActivityResponse(activity *database.Activity) activityResponse {
	timeMS, err := startDateLocalToMS(activity.StartDateLocal)
	if err != nil {
		app.logger.PrintError(err, map[string]string{"ActivityID": activity.ID.Hex()})
	}

	timeLocal, err := startDateLocal(activity.StartDateLocal, activity.Timezone)
	if err != nil {
		app.logger.PrintError(err, map[string]string{"ActivityID": activity.ID.Hex()})
	}

	return activityResponse{
		Distance:       activity.Distance,
		ElapsedTime:    activity.ElapsedTime,
		ID:             activity.ID.Hex(),
		MovingTime:     activity.MovingTime,
		Name:           activity.Name,
		Polyline:       activity.SummaryPolyline,
		SportType:      activity.SportType,
		StartDateLocal: timeLocal,
		StravaID:       activity.StravaID,
		StartDateMS:    timeMS,
	}
}

func (app *application) makeActivityResponseJSON(activity *database.Activity) ([]byte, error) {
	ar := app.makeActivityResponse(activity)
	return json.Marshal(ar)
}

func (app *application) activityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, ok := vars["userId"]
	if !ok {
		http.Error(w, "missing userId", http.StatusBadRequest)
		return
	}

	activityID, ok := vars["activityId"]
	if !ok {
		http.Error(w, "missing userId", http.StatusBadRequest)
		return
	}

	activity, err := app.models.Activities.GetOne(userID, activityID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := app.makeActivityResponseJSON(activity)
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
