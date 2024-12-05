package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Analytics Service is running!")
	})

	fmt.Println("Analytics Service running on port 3004")
	http.ListenAndServe(":3004", nil)
}
