FROM node:18-alpine AS builder

WORKDIR /app

# Arguments de build pour les variables d'environnement Vite
ARG VITE_API_URL
ARG VITE_WS_URL

# Définir les variables d'environnement pour le build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
