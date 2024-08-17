package database

import (
	"context"
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Athlete struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty"`
	CreatedAt            time.Time          `bson:"created_at,omitempty"`
	UpdatedAt            time.Time          `bson:"updated_at,omitempty"`
	AccessToken          string             `bson:"access_token"`
	AccessTokenExpiresAt int                `bson:"access_token_expires_at"`
	RefreshToken         string             `bson:"refresh_token"`

	// From Strava API
	StravaID    int                  `bson:"strava_id,omitempty"`
	Username    string               `bson:"username,omitempty"`
	Firstname   string               `bson:"firstname,omitempty"`
	Lastname    string               `bson:"lastname,omitempty"`
	City        string               `bson:"city,omitempty"`
	State       string               `bson:"state,omitempty"`
	Country     string               `bson:"country,omitempty"`
	ActivityIds []primitive.ObjectID `bson:"activity_ids,omitempty"`
}

type AthleteModel struct {
	db *mongo.Database
}

func (m AthleteModel) GetOne(id primitive.ObjectID) (*Athlete, error) {
	collection := m.db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	var athlete Athlete
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&athlete)
	if err != nil {
		return nil, err
	}

	return &athlete, nil
}

func (m AthleteModel) UpsertByStravaID(athlete *Athlete) (*Athlete, error) {
	collection := m.db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	filter := bson.M{"strava_id": athlete.StravaID}
	update := bson.M{
		"$set": athlete,
	}

	opts := options.FindOneAndUpdate().SetUpsert(true)

	result := collection.FindOneAndUpdate(ctx, filter, update, opts)
	if result.Err() != nil {
		return nil, result.Err()
	}

	return athlete, nil
}

func (m AthleteModel) GetAthleteResponseJSON(athlete *Athlete) ([]byte, error) {
	type athleteResponse struct {
		ID           string `json:"id"`
		StravaID     int    `json:"strava_id"`
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresAt    int    `json:"expires_at"`
		Firstname    string `json:"firstname"`
		Lastname     string `json:"lastname"`
	}

	ar := athleteResponse{
		ID:           athlete.ID.Hex(),
		StravaID:     athlete.StravaID,
		AccessToken:  athlete.AccessToken,
		RefreshToken: athlete.RefreshToken,
		ExpiresAt:    athlete.AccessTokenExpiresAt,
		Firstname:    athlete.Firstname,
		Lastname:     athlete.Lastname,
	}

	jsonData, err := json.Marshal(ar)
	if err != nil {
		return nil, err
	}

	return jsonData, nil
}
