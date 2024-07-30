package database

import "go.mongodb.org/mongo-driver/mongo"

type Models struct {
	Activities ActivityModel
	Athletes   AthleteModel
}

func NewModels(db *mongo.Database) Models {
	return Models{
		Activities: ActivityModel{db},
		Athletes:   AthleteModel{db},
	}
}
