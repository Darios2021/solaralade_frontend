# ---------------------------
# Build stage
# ---------------------------
FROM node:20 AS build

WORKDIR /app

# Rompemos cache fácilmente cambiando este número si hace falta
ARG CACHE_BUST=1

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ---------------------------
# Serve stage
# ---------------------------
FROM node:20

WORKDIR /app

COPY --from=build /app/dist ./dist

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
