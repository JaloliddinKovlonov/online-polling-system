package routes

import (
	"analytics-service/database"
	"analytics-service/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var analyticsCollection *mongo.Collection

func InitRoutes(router *mux.Router) {
	analyticsCollection = database.MongoClient.Database("analytics").Collection("pollanalytics")

	router.HandleFunc("/results/{pollId}", GetPollResults).Methods("GET")
	router.HandleFunc("/trends", GetVotingTrends).Methods("GET")
	router.HandleFunc("/", CreateAnalytics).Methods("POST")
	router.HandleFunc("/vote", UpdateVotes).Methods("PATCH")
}

func CreateAnalytics(w http.ResponseWriter, r *http.Request) {
	var analytics models.PollAnalytics
	err := json.NewDecoder(r.Body).Decode(&analytics)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Initialize additional fields
	analytics.TotalVotes = 0
	analytics.LastUpdated = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = analyticsCollection.InsertOne(ctx, analytics)
	if err != nil {
		http.Error(w, "Error creating analytics", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// Get results for a specific poll
func GetPollResults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	pollId := vars["pollId"]

	var analytics models.PollAnalytics
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := analyticsCollection.FindOne(ctx, bson.M{"poll_id": pollId}).Decode(&analytics)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Poll results not found", http.StatusNotFound)
			return
		}
		log.Printf("Error fetching poll results: %v", err)
		http.Error(w, "Error fetching poll results", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(analytics)
}

// Get voting trends across polls
func GetVotingTrends(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$unwind", bson.D{{"path", "$results"}}}},
		{{"$group", bson.D{
			{"_id", "$results.text"},
			{"total_votes", bson.D{{"$sum", "$results.votes"}}},
		}}},
		{{"$sort", bson.D{{"total_votes", -1}}}},
	}

	cursor, err := analyticsCollection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Error fetching voting trends: %v", err)
		http.Error(w, "Error fetching voting trends", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var trends []bson.M
	if err = cursor.All(ctx, &trends); err != nil {
		log.Printf("Error decoding trends: %v", err)
		http.Error(w, "Error decoding trends", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(trends)
}

func UpdateVotes(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		PollID   string `json:"poll_id"`
		OptionID string `json:"option_id"`
	}
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Increment the vote count for the specific option
	update := bson.M{
		"$inc": bson.M{
			"results.$.votes": 1,
			"total_votes":     1, // Increment total votes
		},
		"$set": bson.M{
			"last_updated": time.Now(), // Update last updated time
		},
	}
	filter := bson.M{"poll_id": payload.PollID, "results.option_id": payload.OptionID}

	result, err := analyticsCollection.UpdateOne(ctx, filter, update)
	if err != nil || result.MatchedCount == 0 {
		http.Error(w, "Error updating votes", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
