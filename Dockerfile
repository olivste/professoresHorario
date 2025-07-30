FROM node:20-alpine as client-builder

# Set working directory for client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy server files
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ .

# Copy client build from the previous stage
COPY --from=client-builder /app/client/out /app/client/out

# Copy the database migration scripts
COPY server/migrate_db.py .
COPY server/migrate_periodos.py .

# Add start script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE $PORT

# Run the application
CMD ["./start.sh"]
