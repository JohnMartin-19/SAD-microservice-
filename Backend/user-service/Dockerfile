# Use python:3.13-slim as the base image
FROM python:3.13-slim

#set env variables for non-root user
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Upgrade pip
RUN pip install --upgrade pip

# Set working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt .

# Create appuser
RUN useradd -m appuser

# Ensure apt-get directories exist and have correct permissions
RUN mkdir -p /var/lib/apt/lists/partial && \
    chown -R root:root /var/lib/apt/lists && \
    chmod -R 755 /var/lib/apt/lists && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libfreetype6-dev \
        libpng-dev \
        zlib1g-dev \
        libffi-dev \
        python3-dev \
        curl && \
    rm -rf /var/lib/apt/lists/*


RUN pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

# copy application code
COPY . .

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# # Run migrations
# RUN python3 manage.py migrate

# Switch to non-root user
USER appuser
EXPOSE 8001
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# Command to run the application (modify as needed)
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8001"]