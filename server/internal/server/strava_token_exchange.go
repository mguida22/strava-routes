package server

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/mguida22/strava-routes/server/internal/database"
)

type StravaAuthApiUser struct {
	AccessToken string `json:"access_token"`
	Athlete     struct {
		Country       interface{} `json:"country"`
		CreatedAt     string      `json:"created_at"`
		Firstname     string      `json:"firstname"`
		Follower      interface{} `json:"follower"`
		Friend        interface{} `json:"friend"`
		ID            int         `json:"id"`
		Lastname      string      `json:"lastname"`
		Premium       bool        `json:"premium"`
		Profile       string      `json:"profile"`
		ProfileMedium string      `json:"profile_medium"`
		ResourceState int         `json:"resource_state"`
		Sex           string      `json:"sex"`
		State         interface{} `json:"state"`
		Summit        bool        `json:"summit"`
		UpdatedAt     string      `json:"updated_at"`
		Username      string      `json:"username"`
		Weight        float64     `json:"weight"`
	}
	ExpiresAt    int    `json:"expires_at"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

func upsertAthleteFromAuthUser(u StravaAuthApiUser) (*database.Athlete, error) {
	athlete := &database.Athlete{
		AccessToken:          u.AccessToken,
		AccessTokenExpiresAt: u.ExpiresAt,
		RefreshToken:         u.RefreshToken,
		StravaID:             u.Athlete.ID,
		Username:             u.Athlete.Username,
		Firstname:            u.Athlete.Firstname,
		Lastname:             u.Athlete.Lastname,
		City:                 u.Athlete.Country.(string),
		State:                u.Athlete.State.(string),
		Country:              u.Athlete.Country.(string),
	}

	athlete, err := database.UpsertAthleteByStravaID(athlete)
	if err != nil {
		return nil, err
	}

	return athlete, nil
}

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
