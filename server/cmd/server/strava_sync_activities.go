package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

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
		StravaID:             summaryActivity.ID,
		StravaAthleteID:      strconv.Itoa(summaryActivity.Athlete.ID),
		Name:                 summaryActivity.Name,
		Distance:             summaryActivity.Distance,
		MovingTime:           summaryActivity.MovingTime,
		ElapsedTime:          summaryActivity.ElapsedTime,
		TotalElevationGain:   summaryActivity.TotalElevationGain,
		Type:                 summaryActivity.Type,
		SportType:            summaryActivity.SportType,
		WorkoutType:          summaryActivity.WorkoutType,
		StartDate:            summaryActivity.StartDate,
		StartDateLocal:       summaryActivity.StartDateLocal,
		Timezone:             summaryActivity.Timezone,
		UTCOffset:            summaryActivity.UTCOffset,
		StartLatLng:          stravaLatLngToCoordinates(summaryActivity.StartLatlng),
		EndLatLng:            stravaLatLngToCoordinates(summaryActivity.EndLatlng),
		LocationCity:         summaryActivity.LocationCity,
		LocationState:        summaryActivity.LocationState,
		LocationCountry:      summaryActivity.LocationCountry,
		Trainer:              summaryActivity.Trainer,
		Commute:              summaryActivity.Commute,
		Manual:               summaryActivity.Manual,
		Private:              summaryActivity.Private,
		AverageSpeed:         summaryActivity.AverageSpeed,
		MaxSpeed:             summaryActivity.MaxSpeed,
		AverageCadence:       summaryActivity.AverageCadence,
		AverageWatts:         summaryActivity.AverageWatts,
		WeightedAverageWatts: summaryActivity.WeightedAverageWatts,
		Kilojoules:           summaryActivity.Kilojoules,
		DeviceWatts:          summaryActivity.DeviceWatts,
		HasHeartrate:         summaryActivity.HasHeartrate,
		AverageHeartrate:     summaryActivity.AverageHeartrate,
		MaxHeartrate:         summaryActivity.MaxHeartrate,
		MaxWatts:             summaryActivity.MaxWatts,
		PRCount:              summaryActivity.PRCount,
		TotalPhotoCount:      summaryActivity.TotalPhotoCount,
		HasKudoed:            summaryActivity.HasKudoed,
		SufferScore:          summaryActivity.SufferScore,
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

func (app *application) fetchAndStoreActivities(athlete *database.Athlete) (int, error) {
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

	count, err := app.fetchAndStoreActivities(athlete)
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write([]byte("Synced " + strconv.Itoa(count) + " activities"))
	if err != nil {
		app.logger.PrintError(err, nil)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
