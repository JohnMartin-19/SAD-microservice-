FROM python:3.13

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    zlib1g-dev \
    libffi-dev \
    python3-dev \
    # Add Rust toolchain for pydantic_core
    curl \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && . "$HOME/.cargo/env" \
    # Clean up apt caches
    && rm -rf /var/lib/apt/lists/* \
    # Optional: remove rustup installer to keep image size small
    && rm -rf "$HOME/.rustup" "$HOME/.cargo"


RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python3 manage.py migrate

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]