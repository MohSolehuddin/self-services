FROM node:20-alpine

WORKDIR /app

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 py3-pip make g++

# Copy package files
COPY package*.json ./

# Install dependencies (with build dependencies available)
RUN npm install --omit=dev

# Copy application code
COPY src/ ./src/
COPY .env.example .env

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "src/server.js"]
