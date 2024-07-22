package server

import (
	"net/http"

	"github.com/gorilla/mux"
)

func activityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	activityID := vars["activityId"]
	w.Write([]byte("Activity ID: " + activityID + " for user ID: " + userID))
}
