# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy app artifacts
COPY --from=build /app .

EXPOSE 3000
# Ensure Next binds to 0.0.0.0
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT:-3000}"]
