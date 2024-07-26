package server

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func HttpServer(addr string) *http.Server {
	r := mux.NewRouter()

	r.Use(loggingMiddleware)

	r.HandleFunc("/health", healthHandler).Methods("GET")
	r.HandleFunc("/strava/token-exchange", stravaTokenExchangeHandler).Methods("POST")
	r.HandleFunc("/strava/token-refresh", stravaTokenRefreshHandler).Methods("POST")
	r.HandleFunc("/{userId}/activities", activitiesHandler).Methods("GET")
	r.HandleFunc("/{userId}/activities/{activityId}", activityHandler).Methods("GET")

	return &http.Server{
		Addr:    addr,
		Handler: r,
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("OK"))
	if err != nil {
		log.Printf("Error writing response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
