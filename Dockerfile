# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy dependency file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose application port
EXPOSE 5000

# Start application
CMD ["python", "app.py"]
