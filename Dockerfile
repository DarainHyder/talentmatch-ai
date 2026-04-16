FROM python:3.10-slim

# Install system deps (gcc needed for some Python packages)
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# HuggingFace Spaces requires the app to run as a non-root user
RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /home/user/app

# Install Python dependencies
COPY --chown=user backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the entire backend package
COPY --chown=user backend/ ./backend/

# Copy model output (367MB - only present when included in the Space repo)
# If not present, DeBERTa gracefully falls back to Gemini
COPY --chown=user scripts/ ./scripts/

# HuggingFace Spaces default port is 7860
EXPOSE 7860

# Gunicorn: 1 worker (RAM-constrained free tier), 120s timeout for CV parsing
CMD ["gunicorn", "backend.app:app", "--bind", "0.0.0.0:7860", "--workers", "1", "--timeout", "120", "--preload"]
