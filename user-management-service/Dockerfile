# Use the official Node.js image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Add wait-for-it script
COPY wait-for-it.sh /usr/bin/wait-for-it

# Expose the port
EXPOSE 3000

# Use wait-for-it to ensure the database is ready
CMD ["wait-for-it", "db:5432", "--", "node", "index.js"]
