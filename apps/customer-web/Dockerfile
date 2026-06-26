FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/customer-web/package.json ./
RUN npm install --legacy-peer-deps

COPY apps/customer-web/ ./

RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/customer-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
