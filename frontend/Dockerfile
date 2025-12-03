# Stage 1: Dependencies - cache layer
FROM node:18-alpine as deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent

FROM node:18-alpine as dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["npm", "start"]