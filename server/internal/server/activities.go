package server

import (
	"net/http"

	"github.com/gorilla/mux"
)

func activitiesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	w.Write([]byte("List of activities for user ID: " + userId))
}
