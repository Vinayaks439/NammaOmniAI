# ---------- Dockerfile ----------
# 1. use slim base with Python 3.12
FROM python:3.12-slim AS runtime

# 2. set working directory
WORKDIR /app

# 3. install system packages (just in case httpx/OpenSSL need build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# 4. copy dependency list & install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. copy project code
#    adjust the source path if your repo layout differs
COPY agents ./agents

# 6. environment variables
#    – model + temperature are read from agent_config.json
#    – supply your API key at runtime:  docker run -e GOOGLE_API_KEY=xxxx ...
ENV PYTHONUNBUFFERED=1 \
    GOOGLE_API_KEY=""

# 7. default command
#    change the path if you moved or renamed orca.py
CMD ["python", "agents/energy-management-orchestrator/orca.py"]

