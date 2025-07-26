# ──────────────────────────────────────────────────────────────────────────────
# Dockerfile ‑ Pothole Detection Cloud Function (Pub/Sub trigger)
#
# • Uses python 3.11‑slim as the base image
# • Installs pip dependencies (from requirements.txt)
# • Adds the source code
# • Runs the Google Functions Framework so the function can be served
#   locally, on Cloud Functions (2nd gen) or Cloud Run
# ──────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# Recommended: prevent Python from buffering stdout/stderr so logs appear immediately
ENV PYTHONUNBUFFERED=1 \
    # Cloud Functions / Cloud Run default port
    PORT=8080

# Install system packages your deps might need (gcc, libssl, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

# ── Copy requirements and install ────────────────────────────────────────────
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy the rest of the source code ─────────────────────────────────────────
COPY . .

# ── Functions Framework start‑up ─────────────────────────────────────────────
# `--target` is the name of the callable in main.py
ENTRYPOINT ["functions-framework", "--target", "runPotholeDetectionAgent","--signature-type=cloudevent"]
