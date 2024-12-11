package models

type Vote struct {
	VoteID    int    `json:"vote_id"`
	PollID    string `json:"poll_id"`
	OptionID  string `json:"option_id"`
	IPAddress string `json:"ip_address"`
}
