# Backend Dockerfile (backend/Dockerfile)

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY server/ /app/server/
COPY model/ /app/model/


# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/server/requirements.txt

# Copy startup script and make it executable
COPY server/startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Expose port
EXPOSE 8000

# Start with the startup script
CMD ["/app/startup.sh"]
