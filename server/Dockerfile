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
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/server/requirements.txt

# Run the user creation script at build or startup
RUN python /app/server/create_user.py

# Expose port
EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "/app/server"]
