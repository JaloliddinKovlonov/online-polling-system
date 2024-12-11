package models

import "time"

type PollAnalytics struct {
	PollID      string       `bson:"poll_id" json:"poll_id"`
	Title       string       `bson:"title" json:"title"` // Added poll title
	Results     []PollResult `bson:"results" json:"results"`
	TotalVotes  int          `bson:"total_votes" json:"total_votes"`
	LastUpdated time.Time    `bson:"last_updated" json:"last_updated"`
}

type PollResult struct {
	OptionID string `bson:"option_id" json:"option_id"`
	Text     string `bson:"text" json:"text"`
	Votes    int    `bson:"votes" json:"votes"`
}
