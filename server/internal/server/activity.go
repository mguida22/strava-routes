package server

import (
	"net/http"

	"github.com/gorilla/mux"
)

func activityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	activityID := vars["activityId"]

	fp := "data/activities/" + activityID + ".json"
	http.ServeFile(w, r, fp)
}
