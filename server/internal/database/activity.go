package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func CreateActivity(activity *Activity) error {
	collection := db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	activity.CreatedAt = time.Now()
	activity.UpdatedAt = time.Now()

	_, err := collection.InsertOne(ctx, activity)
	return err
}

func GetActivity(id string) (*Activity, error) {
	collection := db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	var activity Activity
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&activity)
	if err != nil {
		return nil, err
	}

	return &activity, nil
}

func GetActivities() ([]*Activity, error) {
	collection := db.Collection("activities")
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

func UpdateActivity(id string, activity *Activity) error {
	collection := db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	activity.UpdatedAt = time.Now()

	_, err := collection.ReplaceOne(ctx, bson.M{"_id": id}, activity)
	return err
}

func DeleteActivity(id string) error {
	collection := db.Collection("activities")
	ctx, cancel := context.WithTimeout(context.Background(), OperationTimeout)
	defer cancel()

	_, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
