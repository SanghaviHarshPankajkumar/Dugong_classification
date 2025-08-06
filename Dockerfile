# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app
COPY front/ /app/
RUN npm install && npm run build

# Stage 2: Backend + Frontend + MongoDB + Nginx
FROM python:3.9-slim

# Install MongoDB
# RUN apt-get update && \
#     apt-get install -y gnupg curl && \
#     curl -fsSL https://pgp.mongodb.com/server-5.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-5.0.gpg && \
#     echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-5.0.gpg ] https://repo.mongodb.org/apt/debian buster/mongodb-org/5.0 main" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list && \
#     apt-get update && \
#     apt-get install -y mongodb-org && \
#     rm -rf /var/lib/apt/lists/*

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    ffmpeg \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Set environment
ENV PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0

# Create app folders
# RUN mkdir -p /app/backend /app/frontend /data/db /var/log/mongodb

WORKDIR /app

# Copy backend code
COPY server/ /app/backend/
COPY model/ /app/model/

# Install backend requirements
RUN pip install --upgrade pip
RUN pip install  -r /app/backend/requirements.txt

# Copy built frontend
COPY --from=frontend-builder /app/dist /app/frontend/

# Copy and configure Nginx
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script and make executable
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Expose port for Cloud Run
EXPOSE 8080

# Start everything via script
CMD ["/app/startup.sh"]
