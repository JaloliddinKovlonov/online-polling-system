# Use the official Go image
FROM golang:1.19

# Set the working directory in the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

COPY wait-for-it.sh /usr/bin/wait-for-it


# Download dependencies
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o voting-service

# Expose the port the app runs on
EXPOSE 3003

# Run the application
CMD ["./voting-service"]
