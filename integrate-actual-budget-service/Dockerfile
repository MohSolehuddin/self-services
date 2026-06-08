FROM node:20-alpine

WORKDIR /app

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 py3-pip make g++ postgresql-client

# Copy package files
COPY package*.json ./

# Install dependencies (with build dependencies available)
RUN npm install --omit=dev

# Copy application code
COPY src/ ./src/

# Copy .env file from host (pastikan .env sudah ada di build context)
COPY .env* ./

# Jika .env tidak ada, .env.example akan jadi fallback
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Fix permissions for all files (pastikan nodejs bisa baca semua file)
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "src/server.js"]
