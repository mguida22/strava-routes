package database

import (
	"context"
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

func (m AthleteModel) Create(athlete *Athlete) (string, error) {
	collection := m.db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	athlete.CreatedAt = time.Now()
	athlete.UpdatedAt = time.Now()

	result, err := collection.InsertOne(ctx, athlete)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (m AthleteModel) GetOne(id string) (*Athlete, error) {
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

func (m AthleteModel) GetMany() ([]*Athlete, error) {
	collection := m.db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var athletes []*Athlete
	for cursor.Next(ctx) {
		var athlete Athlete
		if err := cursor.Decode(&athlete); err != nil {
			return nil, err
		}
		athletes = append(athletes, &athlete)
	}

	return athletes, nil
}

func (m AthleteModel) UpdateByID(athlete *Athlete) error {
	collection := m.db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	athlete.UpdatedAt = time.Now()

	_, err := collection.ReplaceOne(ctx, bson.M{"_id": athlete.ID}, athlete)
	return err
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

	var updatedAthlete Athlete
	err := result.Decode(&updatedAthlete)
	if err != nil {
		return nil, err
	}

	return &updatedAthlete, nil
}

func (m AthleteModel) Delete(id string) error {
	collection := m.db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	_, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
