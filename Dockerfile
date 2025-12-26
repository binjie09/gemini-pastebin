# Build Frontend
FROM --platform=$BUILDPLATFORM node:22-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ .
RUN npm run build

# Build Backend
FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production --legacy-peer-deps
COPY server/ .
# Copy built frontend to server's public directory
COPY --from=client-build /client/dist ./public

EXPOSE 3015
ENV PORT=3015
CMD ["npm", "start"]
