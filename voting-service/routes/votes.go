package routes

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
	"voting-service/database"
	"voting-service/models"

	"github.com/gorilla/mux"
)

// Helper function to get IP address
func getIPAddress(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	if strings.Contains(ip, ":") {
		ip = strings.Split(ip, ":")[0]
	}
	return ip
}

func SubmitVote(w http.ResponseWriter, r *http.Request) {
	var vote models.Vote
	err := json.NewDecoder(r.Body).Decode(&vote)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if vote.PollID == "" || vote.OptionID == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Get IP address
	ipAddress := getIPAddress(r)

	// Fetch poll details from Poll Management Service
	pollServiceURL := "http://poll-management:3002/" + vote.PollID
	resp, err := http.Get(pollServiceURL)
	if err != nil {
		log.Printf("Error fetching poll details: %v", err)
		http.Error(w, "Error validating poll", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Poll Management Service returned status: %v", resp.StatusCode)
		http.Error(w, "Error validating poll", http.StatusBadRequest)
		return
	}

	var poll struct {
		ExpiresAt string `json:"expires_at"`
	}
	err = json.NewDecoder(resp.Body).Decode(&poll)
	if err != nil {
		log.Printf("Error decoding poll details: %v", err)
		http.Error(w, "Error validating poll", http.StatusInternalServerError)
		return
	}

	// Check if the poll has expired
	expiresAt, err := time.Parse(time.RFC3339, poll.ExpiresAt)
	if err != nil {
		log.Printf("Error parsing expiration date: %v", err)
		http.Error(w, "Error validating poll", http.StatusInternalServerError)
		return
	}
	if time.Now().After(expiresAt) {
		http.Error(w, "This poll has expired.", http.StatusBadRequest)
		return
	}

	// Check if IP address has already voted
	query := `SELECT 1 FROM votes WHERE poll_id = $1 AND ip_address = $2`
	row := database.DB.QueryRow(query, vote.PollID, ipAddress)

	var exists int
	err = row.Scan(&exists)
	if err == nil {
		http.Error(w, "This IP address has already voted in this poll.", http.StatusBadRequest)
		return
	}

	// Insert the vote
	query = `INSERT INTO votes (poll_id, option_id, ip_address) VALUES ($1, $2, $3)`
	_, err = database.DB.Exec(query, vote.PollID, vote.OptionID, ipAddress)
	if err != nil {
		log.Printf("Error inserting vote: %v", err)
		http.Error(w, "Error submitting vote", http.StatusInternalServerError)
		return
	}

	// Update Analytics
	updateAnalytics(vote.PollID, vote.OptionID)

	// Send a notification to the poll creator
	sendNotification(vote.PollID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Vote submitted successfully"})
}

func GetVotes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	pollID := vars["pollId"]

	query := `SELECT option_id, COUNT(*) as votes FROM votes WHERE poll_id = $1 GROUP BY option_id`
	rows, err := database.DB.Query(query, pollID)
	if err != nil {
		log.Printf("Error fetching votes: %v", err)
		http.Error(w, "Error fetching votes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	results := make(map[string]int)
	for rows.Next() {
		var optionID string
		var count int
		rows.Scan(&optionID, &count)
		results[optionID] = count
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func updateAnalytics(pollID, optionID string) {
	analyticsPayload := map[string]string{
		"poll_id":   pollID,
		"option_id": optionID,
	}
	jsonData, _ := json.Marshal(analyticsPayload)

	client := &http.Client{}
	req, err := http.NewRequest("PATCH", "http://analytics-service:3004/vote", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error creating HTTP request for Analytics Service: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error sending PATCH request to Analytics Service: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Analytics Service returned status: %v", resp.StatusCode)
	}
}

func sendNotification(pollID string) {
	pollServiceURL := "http://poll-management:3002/" + pollID

	resp, err := http.Get(pollServiceURL)
	if err != nil {
		log.Printf("Error fetching poll details: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Poll Management Service returned status: %v", resp.StatusCode)
		return
	}

	var poll struct {
		PollID       string `json:"poll_id"`
		Title        string `json:"title"`
		CreatorEmail string `json:"creator_email"`
	}
	err = json.NewDecoder(resp.Body).Decode(&poll)
	if err != nil {
		log.Printf("Error decoding poll details: %v", err)
		return
	}

	notificationPayload := map[string]string{
		"poll_id":       poll.PollID,
		"creator_email": poll.CreatorEmail,
		"poll_title":    poll.Title,
	}
	jsonData, _ := json.Marshal(notificationPayload)

	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://notification-service:3005/", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error creating HTTP request for Notification Service: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err = client.Do(req)
	if err != nil {
		log.Printf("Error sending POST request to Notification Service: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Notification Service returned status: %v", resp.StatusCode)
	}
}
