FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package*.json ./
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci --legacy-peer-deps

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build worker --configuration=production
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

FROM base AS runtime
ENV NODE_ENV=production

COPY --from=build /app/dist/apps/worker ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma

CMD ["node", "dist/main.js"]
