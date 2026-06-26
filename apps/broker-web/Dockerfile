FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/broker-web/package.json ./
RUN npm install --legacy-peer-deps

COPY apps/broker-web/ ./

RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/broker-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
