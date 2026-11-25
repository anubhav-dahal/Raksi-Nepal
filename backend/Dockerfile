# Production image for the Nepalgunj Sips API.
#   docker build -t nepalgunj-sips-api backend
#   docker run -p 5000:5000 --env-file backend/.env -v sips-uploads:/data/uploads nepalgunj-sips-api
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=5000 \
    UPLOAD_DIR=/data/uploads

COPY package*.json ./
# mongodb-memory-server is a dev dependency and isn't installed here.
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public

# Admin-uploaded photos live on a volume so they survive redeploys.
RUN mkdir -p /data/uploads && chown -R node:node /data /app
VOLUME ["/data/uploads"]

USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
