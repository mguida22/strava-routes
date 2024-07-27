package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func CreateAthlete(athlete *Athlete) (string, error) {
	collection := db.Collection("athletes")
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

func GetAthlete(id string) (*Athlete, error) {
	collection := db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	var athlete Athlete
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&athlete)
	if err != nil {
		return nil, err
	}

	return &athlete, nil
}

func GetAthletes() ([]*Athlete, error) {
	collection := db.Collection("athletes")
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

func UpdateAthlete(id string, athlete *Athlete) error {
	collection := db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	athlete.UpdatedAt = time.Now()

	_, err := collection.ReplaceOne(ctx, bson.M{"_id": id}, athlete)
	return err
}

func UpsertAthleteByStravaID(athlete *Athlete) (*Athlete, error) {
	collection := db.Collection("athletes")
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

func DeleteAthlete(id string) error {
	collection := db.Collection("athletes")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	_, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
