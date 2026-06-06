FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install express http-proxy-middleware axios

# Copy application code
COPY . .

EXPOSE 11435
CMD ["node", "server.js"]
