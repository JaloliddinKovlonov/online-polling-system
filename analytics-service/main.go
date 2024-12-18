package main

import (
	"analytics-service/database"
	"analytics-service/routes"
	"log"
	"net/http"
	"os"

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

	router := mux.NewRouter()
	routes.InitRoutes(router)

	// Get frontend URL from the environment variable
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		log.Fatal("FRONTEND_URL environment variable is not set")
	}

	corsOptions := handlers.CORS(
		handlers.AllowedOrigins([]string{frontendURL}), // Your React app's URL
		handlers.AllowedMethods([]string{"GET", "POST", "PATCH", "DELETE"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	port := "3004"
	log.Printf("Analytics Service running on port %s", port)
	log.Fatal(http.ListenAndServe(":3004", corsOptions(router)))
}
