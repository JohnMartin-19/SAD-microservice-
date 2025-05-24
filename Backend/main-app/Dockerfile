FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    zlib1g-dev \
    # Clean up apt caches to keep image size small
    && rm -rf /var/lib/apt/lists/*

# If your base image is Python 3.13-alpine (Alpine Linux-based), use apk instead:
# RUN apk add --no-cache \
#     build-base \
#     freetype-dev \
#     libpng-dev \
#     zlib-dev

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python3 manage.py migrate

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"] 