# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de servir estático
FROM nginx:alpine

# Usamos nuestro default.conf minimalista
COPY default.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos compilados de Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
