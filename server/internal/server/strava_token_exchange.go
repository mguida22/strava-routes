package server

import (
	"io"
	"log"
	"net/http"
	"os"
)

func exchangeCodeForAuthInfo(code string) ([]byte, error) {
	url := "https://www.strava.com/oauth/token?client_id=" + os.Getenv("STRAVA_CLIENT_ID") + "&client_secret=" + os.Getenv("STRAVA_CLIENT_SECRET") + "&code=" + code + "&grant_type=authorization_code"

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

func stravaTokenExchangeHandler(w http.ResponseWriter, r *http.Request) {
	code := r.FormValue("code")

	authInfo, err := exchangeCodeForAuthInfo(code)
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
