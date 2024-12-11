package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	var err error
	connStr := os.Getenv("DATABASE_URL")
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatalf("Error pinging the database: %v", err)
	}

	fmt.Println("Connected to the database")
}

func InitDB() {
	createVotesTable := `
    CREATE TABLE IF NOT EXISTS votes (
        vote_id SERIAL PRIMARY KEY,
        poll_id VARCHAR(50) NOT NULL,
        option_id VARCHAR(50) NOT NULL,
        ip_address VARCHAR(255) NOT NULL,
        UNIQUE (poll_id, ip_address)
    );
    `

	_, err := DB.Exec(createVotesTable)
	if err != nil {
		log.Fatalf("Error creating votes table: %v", err)
	}
	log.Println("Votes table ensured.")
}
