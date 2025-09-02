# syntax=docker/dockerfile:1.6

# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app
# tools for native modules (bcrypt, sharp, node-gyp, etc.)
RUN apk add --no-cache libc6-compat python3 make g++

# make npm resilient to flaky networks
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/ \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

COPY package*.json ./
# if you create a .npmrc (next step), copy it before npm ci
COPY .npmrc .npmrc
# cache npm folder between builds
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline

# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node","server.js"]
