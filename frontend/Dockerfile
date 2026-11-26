FROM node:24.22.3-bookworm-slim

WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY --chown=node:node frontend/ .
COPY data/presidency-scores.stage-2.json data/presidency-assessments.stage-2.json data/historical-events.stage-1.json /data/
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
