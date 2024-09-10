package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/mguida22/strava-routes/server/internal/database"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var STRAVA_PAGE_SIZE = 30

// https://developers.strava.com/docs/reference/#api-models-SummaryActivity
type StravaSummaryActivity struct {
	ResourceState int `json:"resource_state"`
	Athlete       struct {
		ID            int `json:"id"`
		ResourceState int `json:"resource_state"`
	} `json:"athlete"`
	Name               string    `json:"name"`
	Distance           float64   `json:"distance"`
	MovingTime         int       `json:"moving_time"`
	ElapsedTime        int       `json:"elapsed_time"`
	TotalElevationGain float64   `json:"total_elevation_gain"`
	Type               string    `json:"type"`
	SportType          string    `json:"sport_type"`
	WorkoutType        int       `json:"workout_type"`
	ID                 int       `json:"id"`
	ExternalID         string    `json:"external_id"`
	UploadID           int64     `json:"upload_id"`
	StartDate          string    `json:"start_date"`
	StartDateLocal     string    `json:"start_date_local"`
	Timezone           string    `json:"timezone"`
	UTCOffset          float64   `json:"utc_offset"`
	StartLatlng        []float64 `json:"start_latlng"`
	EndLatlng          []float64 `json:"end_latlng"`
	LocationCity       string    `json:"location_city"`
	LocationState      string    `json:"location_state"`
	LocationCountry    string    `json:"location_country"`
	AchievementCount   int       `json:"achievement_count"`
	KudosCount         int       `json:"kudos_count"`
	CommentCount       int       `json:"comment_count"`
	AthleteCount       int       `json:"athlete_count"`
	PhotoCount         int       `json:"photo_count"`
	Map                struct {
		ID              string `json:"id"`
		SummaryPolyline string `json:"summary_polyline"`
		ResourceState   int    `json:"resource_state"`
	} `json:"map"`
	Trainer              bool    `json:"trainer"`
	Commute              bool    `json:"commute"`
	Manual               bool    `json:"manual"`
	Private              bool    `json:"private"`
	Flagged              bool    `json:"flagged"`
	GearID               string  `json:"gear_id"`
	FromAcceptedTag      bool    `json:"from_accepted_tag"`
	AverageSpeed         float64 `json:"average_speed"`
	MaxSpeed             float64 `json:"max_speed"`
	AverageCadence       float64 `json:"average_cadence"`
	AverageWatts         float64 `json:"average_watts"`
	WeightedAverageWatts int     `json:"weighted_average_watts"`
	Kilojoules           float64 `json:"kilojoules"`
	DeviceWatts          bool    `json:"device_watts"`
	HasHeartrate         bool    `json:"has_heartrate"`
	AverageHeartrate     float64 `json:"average_heartrate"`
	MaxHeartrate         float64 `json:"max_heartrate"`
	MaxWatts             int     `json:"max_watts"`
	PRCount              int     `json:"pr_count"`
	TotalPhotoCount      int     `json:"total_photo_count"`
	HasKudoed            bool    `json:"has_kudoed"`
	SufferScore          int     `json:"suffer_score"`
}

func stravaLatLngToCoordinates(latlng []float64) database.Coordinates {
	if len(latlng) != 2 {
		return database.Coordinates{}
	}

	return database.Coordinates{Latitude: latlng[0], Longitude: latlng[1]}
}

func activityFromSummaryActivity(summaryActivity StravaSummaryActivity) *database.Activity {
	return &database.Activity{
		AthleteID:            primitive.NilObjectID,
		AverageCadence:       summaryActivity.AverageCadence,
		AverageHeartrate:     summaryActivity.AverageHeartrate,
		AverageSpeed:         summaryActivity.AverageSpeed,
		AverageWatts:         summaryActivity.AverageWatts,
		Commute:              summaryActivity.Commute,
		DeviceWatts:          summaryActivity.DeviceWatts,
		Distance:             summaryActivity.Distance,
		ElapsedTime:          summaryActivity.ElapsedTime,
		EndLatLng:            stravaLatLngToCoordinates(summaryActivity.EndLatlng),
		HasHeartrate:         summaryActivity.HasHeartrate,
		HasKudoed:            summaryActivity.HasKudoed,
		Kilojoules:           summaryActivity.Kilojoules,
		LocationCity:         summaryActivity.LocationCity,
		LocationCountry:      summaryActivity.LocationCountry,
		LocationState:        summaryActivity.LocationState,
		Manual:               summaryActivity.Manual,
		MaxHeartrate:         summaryActivity.MaxHeartrate,
		MaxSpeed:             summaryActivity.MaxSpeed,
		MaxWatts:             summaryActivity.MaxWatts,
		MovingTime:           summaryActivity.MovingTime,
		Name:                 summaryActivity.Name,
		PRCount:              summaryActivity.PRCount,
		Private:              summaryActivity.Private,
		SportType:            summaryActivity.SportType,
		StartDate:            summaryActivity.StartDate,
		StartDateLocal:       summaryActivity.StartDateLocal,
		StartLatLng:          stravaLatLngToCoordinates(summaryActivity.StartLatlng),
		StravaAthleteID:      strconv.Itoa(summaryActivity.Athlete.ID),
		StravaID:             summaryActivity.ID,
		SufferScore:          summaryActivity.SufferScore,
		SummaryPolyline:      summaryActivity.Map.SummaryPolyline,
		Timezone:             summaryActivity.Timezone,
		TotalElevationGain:   summaryActivity.TotalElevationGain,
		TotalPhotoCount:      summaryActivity.TotalPhotoCount,
		Trainer:              summaryActivity.Trainer,
		Type:                 summaryActivity.Type,
		UTCOffset:            summaryActivity.UTCOffset,
		WeightedAverageWatts: summaryActivity.WeightedAverageWatts,
		WorkoutType:          summaryActivity.WorkoutType,
	}
}

func requestOnePageOfActivities(accessToken string, page int) ([]StravaSummaryActivity, error) {
	url := "https://www.strava.com/api/v3/athlete/activities?page=" + strconv.Itoa(page) + "&per_page=" + strconv.Itoa(STRAVA_PAGE_SIZE)

	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Authorization", "Bearer "+accessToken)
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("strava is unauthorized")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	stravaSummaryActivities := []StravaSummaryActivity{}
	err = json.Unmarshal(body, &stravaSummaryActivities)
	if err != nil {
		return nil, err
	}

	return stravaSummaryActivities, nil
}

func (app *application) validateStravaCredentials(athlete *database.Athlete) (*database.Athlete, error) {
	if athlete.AccessToken == "" {
		return nil, fmt.Errorf("missing access token")
	}

	if athlete.RefreshToken == "" {
		return nil, fmt.Errorf("missing refresh token")
	}

	// check if the expiresAt time has passed
	if athlete.AccessTokenExpiresAt < int(time.Now().Unix()) {
		athlete, err := app.models.Athletes.RefreshAuthCode(athlete)
		if err != nil {
			return nil, err
		}

		return athlete, nil
	}

	return athlete, nil
}

func (app *application) fetchAndStoreActivities(athlete *database.Athlete) (int, error) {
	athlete, err := app.validateStravaCredentials(athlete)
	if err != nil {
		return 0, err
	}

	page := 1
	count := 0
	for {
		activities, err := requestOnePageOfActivities(athlete.AccessToken, page)
		if err != nil {
			return count, err
		}

		for _, summaryActivity := range activities {
			activity := activityFromSummaryActivity(summaryActivity)
			activity.AthleteID = athlete.ID

			err := app.models.Activities.Upsert(activity)
			if err != nil {
				return count, err
			}

			count++
		}

		// if we got less than STRAVA_PAGE_SIZE activities, then we're done
		if len(activities) < STRAVA_PAGE_SIZE {
			break
		}

		page++
	}

	return count, nil
}

func (app *application) stravaSyncActivitiesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, ok := vars["userId"]
	if !ok {
		http.Error(w, "missing userId", http.StatusBadRequest)
		return
	}

	mongoUserID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, "invalid userId", http.StatusBadRequest)
		return
	}

	athlete, err := app.models.Athletes.GetOne(mongoUserID)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	go func() {
		msg := fmt.Sprintf("syncing activities for athlete %s", athlete.ID.Hex())
		app.logger.PrintInfo(msg, nil)
		count, err := app.fetchAndStoreActivities(athlete)
		if err != nil {
			app.logger.PrintError(err, nil)
			return
		}

		msg = fmt.Sprintf("synced %d activities for athlete %s", count, athlete.ID.Hex())
		app.logger.PrintInfo(msg, nil)
	}()

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write([]byte(`{"message": "syncing activities"}`))
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
