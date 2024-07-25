package server

import (
	"io"
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

	return body, nil
}

func stravaTokenRefreshHandler(w http.ResponseWriter, r *http.Request) {
	refreshToken := r.FormValue("refresh_token")

	authInfo, err := refreshAuthCode(refreshToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(authInfo)
}
