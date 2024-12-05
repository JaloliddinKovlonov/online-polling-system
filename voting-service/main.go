package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Voting Service is running!")
	})

	fmt.Println("Voting Service running on port 3003")
	http.ListenAndServe(":3003", nil)
}
