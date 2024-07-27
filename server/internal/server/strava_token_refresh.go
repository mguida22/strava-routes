package server

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
)

func refreshAuthCode(refreshToken string) ([]byte, error) {
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

	athlete, err := upsertAthleteFromAuthUser(u)
	if err != nil {
		return nil, err
	}

	encodedJSON, err := json.Marshal(athlete)
	if err != nil {
		return nil, err
	}

	return encodedJSON, nil
}

func stravaTokenRefreshHandler(w http.ResponseWriter, r *http.Request) {
	refreshToken := r.FormValue("refresh_token")

	authInfo, err := refreshAuthCode(refreshToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(authInfo)
	if err != nil {
		log.Printf("Error writing response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
