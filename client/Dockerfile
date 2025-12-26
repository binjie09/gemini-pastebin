FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set default API URL for docker-compose environment (can be overridden but this is build time)
# For runtime config in React, we usually need a placeholder or specific handling.
# Since we are using Vite, we can bake in the URL if we know it, or use a runtime config script.
# For simplicity in this "local docker compose" setup, we'll assume localhost:3001 or use a relative path proxy if we set up nginx proxy.
# But let's assume the user accesses http://localhost:3001 for API.
# Actually, better to proxy /api in nginx to the server.
ENV VITE_API_URL=http://localhost:3001/api
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
