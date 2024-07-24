package server

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"
)

func activitiesHandler(w http.ResponseWriter, r *http.Request) {
	activity, err := getActivityJson()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(activity))
}

func getActivityJson() ([]byte, error) {
	f, err := os.Open("data/activities.json")
	if err != nil {
		return nil, err
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		return nil, err
	}

	type Activity struct {
		ActivityID                string `json:"activity_id"`
		ActivityDate              string `json:"activity_date"`
		ActivityName              string `json:"activity_name"`
		ActivityType              string `json:"activity_type"`
		ActivityDescription       string `json:"activity_description"`
		ElapsedTime               string `json:"elapsed_time"`
		Distance                  string `json:"distance"`
		MaxHeartRate              string `json:"max_heart_rate"`
		RelativeEffort            string `json:"relative_effort"`
		Commute                   string `json:"commute"`
		ActivityPrivateNote       string `json:"activity_private_note"`
		ActivityGear              string `json:"activity_gear"`
		Filename                  string `json:"filename"`
		AthleteWeight             string `json:"athlete_weight"`
		BikeWeight                string `json:"bike_weight"`
		ElapsedTime1              string `json:"elapsed_time_1"`
		MovingTime                string `json:"moving_time"`
		Distance1                 string `json:"distance_1"`
		MaxSpeed                  string `json:"max_speed"`
		AverageSpeed              string `json:"average_speed"`
		ElevationGain             string `json:"elevation_gain"`
		ElevationLoss             string `json:"elevation_loss"`
		ElevationLow              string `json:"elevation_low"`
		ElevationHigh             string `json:"elevation_high"`
		MaxGrade                  string `json:"max_grade"`
		AverageGrade              string `json:"average_grade"`
		AveragePositiveGrade      string `json:"average_positive_grade"`
		AverageNegativeGrade      string `json:"average_negative_grade"`
		MaxCadence                string `json:"max_cadence"`
		AverageCadence            string `json:"average_cadence"`
		MaxHeartRate1             string `json:"max_heart_rate_1"`
		AverageHeartRate          string `json:"average_heart_rate"`
		MaxWatts                  string `json:"max_watts"`
		AverageWatts              string `json:"average_watts"`
		Calories                  string `json:"calories"`
		MaxTemperature            string `json:"max_temperature"`
		AverageTemperature        string `json:"average_temperature"`
		RelativeEffort1           string `json:"relative_effort_1"`
		TotalWork                 string `json:"total_work"`
		NumberOfRuns              string `json:"number_of_runs"`
		UphillTime                string `json:"uphill_time"`
		DownhillTime              string `json:"downhill_time"`
		OtherTime                 string `json:"other_time"`
		PerceivedExertion         string `json:"perceived_exertion"`
		Type                      string `json:"type"`
		StartTime                 string `json:"start_time"`
		WeightedAveragePower      string `json:"weighted_average_power"`
		PowerCount                string `json:"power_count"`
		PreferPerceivedExertion   string `json:"prefer_perceived_exertion"`
		PerceivedRelativeEffort   string `json:"perceived_relative_effort"`
		Commute1                  string `json:"commute_1"`
		TotalWeightLifted         string `json:"total_weight_lifted"`
		FromUpload                string `json:"from_upload"`
		GradeAdjustedDistance     string `json:"grade_adjusted_distance"`
		WeatherObservationTime    string `json:"weather_observation_time"`
		WeatherCondition          string `json:"weather_condition"`
		WeatherTemperature        string `json:"weather_temperature"`
		ApparentTemperature       string `json:"apparent_temperature"`
		Dewpoint                  string `json:"dewpoint"`
		Humidity                  string `json:"humidity"`
		WeatherPressure           string `json:"weather_pressure"`
		WindSpeed                 string `json:"wind_speed"`
		WindGust                  string `json:"wind_gust"`
		WindBearing               string `json:"wind_bearing"`
		PrecipitationIntensity    string `json:"precipitation_intensity"`
		SunriseTime               string `json:"sunrise_time"`
		SunsetTime                string `json:"sunset_time"`
		MoonPhase                 string `json:"moon_phase"`
		Bike                      string `json:"bike"`
		Gear                      string `json:"gear"`
		PrecipitationProbability  string `json:"precipitation_probability"`
		PrecipitationType         string `json:"precipitation_type"`
		CloudCover                string `json:"cloud_cover"`
		WeatherVisibility         string `json:"weather_visibility"`
		UVIndex                   string `json:"uv_index"`
		WeatherOzone              string `json:"weather_ozone"`
		JumpCount                 string `json:"jump_count"`
		TotalGrit                 string `json:"total_grit"`
		AverageFlow               string `json:"average_flow"`
		Flagged                   string `json:"flagged"`
		AverageElapsedSpeed       string `json:"average_elapsed_speed"`
		DirtDistance              string `json:"dirt_distance"`
		NewlyExploredDistance     string `json:"newly_explored_distance"`
		NewlyExploredDirtDistance string `json:"newly_explored_dirt_distance"`
		ActivityCount             string `json:"activity_count"`
		TotalSteps                string `json:"total_steps"`
		CarbonSaved               string `json:"carbon_saved"`
		PoolLength                string `json:"pool_length"`
		TrainingLoad              string `json:"training_load"`
		Intensity                 string `json:"intensity"`
		AverageGradeAdjustedPace  string `json:"average_grade_adjusted_pace"`
		TimerTime                 string `json:"timer_time"`
		TotalCycles               string `json:"total_cycles"`
		Media                     string `json:"media"`
	}

	type ResponseActivity struct {
		ActivityID     string `json:"activity_id"`
		ActivityDate   string `json:"activity_date"`
		ActivityDateMs int    `json:"activity_date_ms"`
		ActivityName   string `json:"activity_name"`
		ActivityType   string `json:"activity_type"`
		Distance       string `json:"distance"`
		MovingTime     string `json:"moving_time"`
	}

	var activities []Activity
	err = json.Unmarshal(data, &activities)
	if err != nil {
		return nil, err
	}

	var responseActivities []ResponseActivity
	for _, activity := range activities {
		activityDate, err := time.Parse("Jan 2, 2006, 3:04:05 PM", activity.ActivityDate)
		if err != nil {
			return nil, err
		}

		activityDateMs := activityDate.UnixNano() / int64(time.Millisecond)

		responseActivities = append(responseActivities, ResponseActivity{
			ActivityID:     activity.ActivityID,
			ActivityDate:   activity.ActivityDate,
			ActivityDateMs: int(activityDateMs),
			ActivityName:   activity.ActivityName,
			ActivityType:   activity.ActivityType,
			Distance:       activity.Distance,
			MovingTime:     activity.MovingTime,
		})
	}

	responseData, err := json.Marshal(responseActivities)
	if err != nil {
		return nil, err
	}

	return responseData, nil
}
