# ---- Builder Stage ----
FROM python:3.11-slim AS builder
WORKDIR /install

# Upgrade pip and install dependencies into a target directory
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --target=/install/package -r requirements.txt

# ---- Runtime Stage ----
FROM python:3.11-slim AS runtime
WORKDIR /app

# Copy installed packages from the builder stage
COPY --from=builder /install/package /usr/local/lib/python3.11/site-packages

# Copy all application code into the container
COPY . .

# Set the command to run the orchestrator agent
CMD ["python", "agents/energy-management-orchestrator/orca.py"]
