package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/mguida22/strava-routes/server/internal/database"
)

func (app *application) refreshAuthCode(refreshToken string) (*database.Athlete, error) {
	url := "https://www.strava.com/oauth/token?client_id=" + os.Getenv("STRAVA_CLIENT_ID") + "&client_secret=" + os.Getenv("STRAVA_CLIENT_SECRET") + "&refresh_token=" + refreshToken + "&grant_type=refresh_token"

	resp, err := http.Post(url, "application/json", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var u StravaAuthApiUser
	if err := json.Unmarshal(body, &u); err != nil {
		return nil, err
	}

	athlete, err := app.upsertAthleteFromAuthUser(u)
	if err != nil {
		return nil, err
	}

	return athlete, nil
}

func (app *application) stravaTokenRefreshHandler(w http.ResponseWriter, r *http.Request) {
	refreshToken := r.FormValue("refresh_token")

	athlete, err := app.refreshAuthCode(refreshToken)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := app.models.Athletes.GetAthleteResponseJSON(athlete)
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
