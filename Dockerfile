### STAGE 1 - BUILD (NO ALPINE)
FROM node:20 AS build
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el proyecto
COPY . .

# Compilamos AMBAS builds
RUN npm run build:calculator && npm run build:green

### STAGE 2 - NGINX
FROM nginx:alpine

# Copiamos los archivos build
COPY --from=build /app/dist /usr/share/nginx/html

# Config NGINX
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
