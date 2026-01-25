FROM node:20 AS builder

WORKDIR /app/client

# Install dependencies
COPY client/package.json ./
RUN npm install

# Copy client source code
COPY client/ ./

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20

WORKDIR /app/client

# Install only production dependencies
COPY client/package.json ./
RUN npm install --omit=dev

# Copy built app from builder
COPY --from=builder /app/client/.next ./.next
COPY client/package.json ./

# Expose port
EXPOSE 3000

# Start the app listening on all interfaces
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
