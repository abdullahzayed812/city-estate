FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/admin-dashboard/package.json ./
RUN npm install --legacy-peer-deps

COPY apps/admin-dashboard/ ./

RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
