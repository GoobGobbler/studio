# services/observability-service/Dockerfile
# Placeholder Dockerfile - Adjust based on actual implementation
# (e.g., custom Node.js service, Grafana/Prometheus stack)

# --- Option 1: Custom Node.js Service ---
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npm run build
EXPOSE 3005
ENV NODE_ENV=production
ENV PORT=3005
CMD ["node", "dist/server.js"]

# --- Option 2: Grafana/Prometheus Stack (Example) ---
# This would likely involve multiple Dockerfiles or a pre-built stack image.
# For simplicity, this file assumes Option 1.
# If using Grafana:
# FROM grafana/grafana:latest
# USER grafana
# EXPOSE 3000
# COPY ./grafana/provisioning /etc/grafana/provisioning/
# COPY ./grafana/dashboards /var/lib/grafana/dashboards/

# If using Prometheus:
# FROM prom/prometheus:latest
# USER nobody
# EXPOSE 9090
# COPY ./prometheus/prometheus.yml /etc/prometheus/prometheus.yml
# CMD ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus"]
```