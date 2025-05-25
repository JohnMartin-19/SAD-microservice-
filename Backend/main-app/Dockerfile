FROM python:3.13-slim

RUN pip install --upgrade pip

WORKDIR /app

COPY requirements.txt .

RUN useradd -m appuser
USER appuser

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    zlib1g-dev \
    libffi-dev \
    python3-dev \
    curl \
    # Clean up apt caches
    && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain and then immediately run pip install in the SAME RUN layer
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && . "$HOME/.cargo/env" \
    && pip install --no-cache-dir -r requirements.txt \
    # Optional: remove rustup installer to keep image size small, after pip install
    && rm -rf "$HOME/.rustup" "$HOME/.cargo"


COPY . .

RUN python3 manage.py migrate

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]