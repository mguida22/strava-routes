package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func main() {
	r := mux.NewRouter()

	if os.Getenv("ENV") == "development" {
		r.Use(loggingMiddleware)
	}

	r.HandleFunc("/{userId}/activities", activitiesHandler).Methods("GET")
	r.HandleFunc("/{userId}/activities/{activityId}", activityHandler).Methods("GET")

	log.Println("Server started on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func activitiesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	w.Write([]byte("List of activities for user ID: " + userId))
}

func activityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	activityID := vars["activityId"]
	w.Write([]byte("Activity ID: " + activityID + " for user ID: " + userID))
}
