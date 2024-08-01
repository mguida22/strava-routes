package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/mguida22/strava-routes/server/internal/database"
)

type StravaAuthApiUser struct {
	AccessToken string `json:"access_token"`
	Athlete     struct {
		Country       string  `json:"country"`
		CreatedAt     string  `json:"created_at"`
		Firstname     string  `json:"firstname"`
		Follower      string  `json:"follower"`
		Friend        string  `json:"friend"`
		ID            int     `json:"id"`
		Lastname      string  `json:"lastname"`
		Premium       bool    `json:"premium"`
		Profile       string  `json:"profile"`
		ProfileMedium string  `json:"profile_medium"`
		ResourceState int     `json:"resource_state"`
		Sex           string  `json:"sex"`
		State         string  `json:"state"`
		Summit        bool    `json:"summit"`
		UpdatedAt     string  `json:"updated_at"`
		Username      string  `json:"username"`
		Weight        float64 `json:"weight"`
	}
	ExpiresAt    int    `json:"expires_at"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

func (app *application) upsertAthleteFromAuthUser(u StravaAuthApiUser) (*database.Athlete, error) {
	athlete := &database.Athlete{
		AccessToken:          u.AccessToken,
		AccessTokenExpiresAt: u.ExpiresAt,
		RefreshToken:         u.RefreshToken,
		StravaID:             u.Athlete.ID,
		Username:             u.Athlete.Username,
		Firstname:            u.Athlete.Firstname,
		Lastname:             u.Athlete.Lastname,
		City:                 u.Athlete.Country,
		State:                u.Athlete.State,
		Country:              u.Athlete.Country,
	}

	athlete, err := app.models.Athletes.UpsertByStravaID(athlete)
	if err != nil {
		return nil, err
	}

	return athlete, nil
}

func (app *application) exchangeCodeForAuthInfo(code string) (*database.Athlete, error) {
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

func (app *application) stravaTokenExchangeHandler(w http.ResponseWriter, r *http.Request) {
	code := r.FormValue("code")

	athlete, err := app.exchangeCodeForAuthInfo(code)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := app.models.Athletes.GetAthleteResponseJSON(athlete)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonData)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
