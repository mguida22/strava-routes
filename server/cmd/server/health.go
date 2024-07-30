package main

import (
	"log"
	"net/http"
)

func (app *application) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("OK"))
	if err != nil {
		log.Printf("Error writing response: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
