# ================================
# ETAPA 1: Base
# ================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ================================
# ETAPA 2: Desarrollo
# ================================
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# ================================
# ETAPA 3: Build
# ================================
FROM base AS build
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production

# ================================
# ETAPA 4: Producción
# ================================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main"]