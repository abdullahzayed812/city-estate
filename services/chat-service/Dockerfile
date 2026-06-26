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

COPY services/chat-service ./services/chat-service

RUN npm ci
RUN npm run build --workspace=services/chat-service

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/services/chat-service/dist ./dist
COPY --from=builder /app/services/chat-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3004

USER node

CMD ["node", "dist/index.js"]
