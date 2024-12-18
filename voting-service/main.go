package main

import (
	"log"
	"net/http"
	"os"
	"voting-service/database"
	"voting-service/routes"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	database.Connect()
	database.InitDB()

	router := mux.NewRouter()
	router.HandleFunc("/", routes.SubmitVote).Methods("POST")
	router.HandleFunc("/{pollId}", routes.GetVotes).Methods("GET")

	// Get frontend URL from the environment variable
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		log.Fatal("FRONTEND_URL environment variable is not set")
	}

	// Apply CORS to the router
	corsOptions := handlers.CORS(
		handlers.AllowedOrigins([]string{frontendURL}), // React app's URL
		handlers.AllowedMethods([]string{"GET", "POST", "PATCH", "DELETE"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3003"
	}

	log.Printf("Voting Service running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsOptions(router))) // Wrap router with CORS
}
