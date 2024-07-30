package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type coordinates struct {
	Latitude  float64 `bson:"latitude,omitempty"`
	Longitude float64 `bson:"longitude,omitempty"`
}

type Activity struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	CreatedAt time.Time          `bson:"created_at,omitempty"`
	UpdatedAt time.Time          `bson:"updated_at,omitempty"`

	// From Strava API
	AthleteID            string      `bson:"athlete_id,omitempty"`
	AverageCadence       float64     `bson:"average_cadence,omitempty"`
	AverageHeartrate     float64     `bson:"average_heartrate,omitempty"`
	AverageSpeed         float64     `bson:"average_speed,omitempty"`
	AverageWatts         float64     `bson:"average_watts,omitempty"`
	Calories             float64     `bson:"calories,omitempty"`
	Commute              bool        `bson:"commute,omitempty"`
	Description          string      `bson:"description,omitempty"`
	DeviceWatts          bool        `bson:"device_watts,omitempty"`
	Distance             float64     `bson:"distance,omitempty"`
	ElapsedTime          int         `bson:"elapsed_time,omitempty"`
	ElevHigh             float64     `bson:"elev_high,omitempty"`
	ElevLow              float64     `bson:"elev_low,omitempty"`
	EndLatLng            coordinates `bson:"end_latlng,omitempty"`
	ExternalID           string      `bson:"external_id,omitempty"`
	HasHeartrate         bool        `bson:"has_heartrate,omitempty"`
	HasKudoed            bool        `bson:"has_kudoed,omitempty"`
	Kilojoules           float64     `bson:"kilojoules,omitempty"`
	LocationCity         string      `bson:"location_city,omitempty"`
	LocationCountry      string      `bson:"location_country,omitempty"`
	LocationState        string      `bson:"location_state,omitempty"`
	Manual               bool        `bson:"manual,omitempty"`
	MaxHeartrate         int         `bson:"max_heartrate,omitempty"`
	MaxSpeed             int         `bson:"max_speed,omitempty"`
	MaxWatts             int         `bson:"max_watts,omitempty"`
	MovingTime           int         `bson:"moving_time,omitempty"`
	Name                 string      `bson:"name,omitempty"`
	Polyline             string      `bson:"polyline,omitempty"`
	PRCount              int         `bson:"pr_count,omitempty"`
	Private              bool        `bson:"private,omitempty"`
	SportType            string      `bson:"sport_type,omitempty"`
	StartDate            string      `bson:"start_date,omitempty"`
	StartDateLocal       string      `bson:"start_date_local,omitempty"`
	StartLatLng          coordinates `bson:"start_latlng,omitempty"`
	StravaID             int         `bson:"strava_id,omitempty"`
	SufferScore          int         `bson:"suffer_score,omitempty"`
	SummaryPolyline      string      `bson:"summary_polyline,omitempty"`
	Timezone             string      `bson:"timezone,omitempty"`
	TotalElevationGain   int         `bson:"total_elevation_gain,omitempty"`
	TotalPhotoCount      int         `bson:"total_photo_count,omitempty"`
	Trainer              bool        `bson:"trainer,omitempty"`
	Type                 string      `bson:"type,omitempty"`
	UTCOffset            int         `bson:"utc_offset,omitempty"`
	WeightedAverageWatts int         `bson:"weighted_average_watts,omitempty"`
	WorkoutType          string      `bson:"workout_type,omitempty"`
}

type ActivityModel struct {
	db *mongo.Database
}

func (m ActivityModel) Create(activity *Activity) error {
	collection := m.db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	activity.CreatedAt = time.Now()
	activity.UpdatedAt = time.Now()

	_, err := collection.InsertOne(ctx, activity)
	return err
}

func (m ActivityModel) GetOne(id string) (*Activity, error) {
	collection := m.db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	var activity Activity
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&activity)
	if err != nil {
		return nil, err
	}

	return &activity, nil
}

func (m ActivityModel) GetMany() ([]*Activity, error) {
	collection := m.db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var activities []*Activity
	for cursor.Next(ctx) {
		var activity Activity
		if err := cursor.Decode(&activity); err != nil {
			return nil, err
		}
		activities = append(activities, &activity)
	}

	return activities, nil
}

func (m ActivityModel) Update(id string, activity *Activity) error {
	collection := m.db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	activity.UpdatedAt = time.Now()

	_, err := collection.ReplaceOne(ctx, bson.M{"_id": id}, activity)
	return err
}

func (m ActivityModel) Delete(id string) error {
	collection := m.db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	_, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
