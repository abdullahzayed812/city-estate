FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

COPY shared/types ./shared/types
COPY shared/errors ./shared/errors
COPY shared/database ./shared/database
COPY shared/utils ./shared/utils
COPY shared/middlewares ./shared/middlewares
COPY shared/response ./shared/response

COPY services/booking-service ./services/booking-service

RUN npm ci --include=dev --foreground-scripts
RUN npm run build --workspace=services/booking-service
RUN [ -d services/booking-service/dist/shared ] && cp -r services/booking-service/dist/shared/. shared/ || true

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/services/booking-service/dist/services/booking-service/src ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/services/booking-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3003

USER node

CMD ["node", "dist/index.js"]
