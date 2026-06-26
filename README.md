# منصة برج العرب العقارية
## Real Estate Platform — Borg El Arab, Egypt

A complete production-ready real estate platform similar to Property Finder / Bayut / Airbnb.

---

## Architecture Overview

```
realestate/
├── apps/
│   ├── customer-mobile/        # React Native — Customer App
│   ├── broker-mobile/          # React Native — Broker/Agent App
│   ├── customer-web/           # React + Vite — Customer Web (port 8083)
│   ├── broker-web/             # React + Vite — Broker Web   (port 8082)
│   └── admin-dashboard/        # React + Vite — Admin Panel  (port 8081)
│
├── services/
│   ├── auth-service/           # Port 3001 — JWT + OTP Authentication
│   ├── property-service/       # Port 3002 — Property CRUD + Search
│   ├── booking-service/        # Port 3003 — Visit & Rental Bookings
│   ├── chat-service/           # Port 3004 — Real-time Chat (Socket.IO)
│   ├── notification-service/   # Port 3005 — Firebase Push Notifications
│   └── media-service/          # Port 3006 — Cloudflare R2 Storage
│
├── shared/
│   ├── database/               # MySQL + Redis connections (Singleton)
│   ├── types/                  # Shared TypeScript interfaces
│   ├── errors/                 # AppError + typed error classes
│   ├── middlewares/            # Auth, rate limiter, validator
│   ├── response/               # ApiResponse helper
│   └── utils/                  # Logger, crypto, pagination
│
├── nginx/
│   └── nginx.conf              # API Gateway config (routes all /api/* traffic)
├── docker-compose.yml
└── .env.example
```

---

## Docker Network Architecture

```
Internet / VPS
      │
      ├── :8080 ──► gateway (nginx)       API gateway — used by mobile apps
      │                 │                  routes /api/* to backend services
      │                 └── /socket.io/ ──► chat-service:3004
      │
      ├── :8081 ──► admin-dashboard       Admin panel SPA
      │                 │                  proxies /api/ → gateway internally
      │
      ├── :8082 ──► broker-web            Broker web SPA
      │                 │                  proxies /api/ and /socket.io/ → internal services
      │
      └── :8083 ──► customer-web          Customer web SPA
                        │
                        └── proxies /api/ and /socket.io/ → internal services

Internal Docker network only (not exposed to host):
  mysql:3306 · redis:6379
  auth-service:3001 · property-service:3002 · booking-service:3003
  chat-service:3004 · notification-service:3005 · media-service:3006
```

### Why this design
- Backend services are **not exposed to the host** — they are only reachable through the gateway or directly within the Docker network.
- Web apps (8081–8083) proxy all `/api/` calls and WebSocket connections internally, so the browser never needs to know the VPS IP — all URLs are relative (`/api/...`).
- Port 8080 is used instead of 80 to avoid conflicts with other systems already running on the VPS.

---

## VPS Deployment

### Prerequisites
- Docker >= 24
- Docker Compose >= 2.x
- Git

### 1. Clone the repository

```bash
git clone <repo-url>
cd cityestate
```

### 2. Set root environment variables

```bash
cp .env.example .env
nano .env   # set DB_ROOT_PASSWORD, DB_PASSWORD, REDIS_PASSWORD
```

### 3. Set per-service secrets

Each service has its own `.env` file. Edit these before deploying:

```bash
nano services/auth-service/.env          # JWT secrets, Twilio (OTP)
nano services/notification-service/.env  # Firebase project ID + credentials
nano services/media-service/.env         # Cloudflare R2 keys
nano services/property-service/.env      # JWT public key, CORS origins
nano services/booking-service/.env       # JWT public key
nano services/chat-service/.env          # JWT public key
```

### 4. Build and start all containers

```bash
docker compose up -d --build
```

This builds all 9 images (6 backend services + 3 web apps) and starts 13 containers total.

### 5. Verify everything is running

```bash
docker compose ps
```

Expected output — all containers should show `Up`:

```
realestate_mysql          Up (healthy)
realestate_redis          Up (healthy)
realestate_auth           Up
realestate_property       Up
realestate_booking        Up
realestate_chat           Up
realestate_notification   Up
realestate_media          Up
realestate_gateway        Up
realestate_admin          Up
realestate_broker_web     Up
realestate_customer_web   Up
```

### 6. Access the apps

| URL | Description |
|-----|-------------|
| `http://VPS_IP:8080/api/auth/health` | API gateway health check |
| `http://VPS_IP:8081` | Admin dashboard |
| `http://VPS_IP:8082` | Broker web app |
| `http://VPS_IP:8083` | Customer web app |

---

## Mobile Apps (React Native)

Mobile apps connect to the VPS over HTTP — they are **not** hosted on the server. You build an APK/IPA and distribute it.

### How mobile connects to the backend

The app has a built-in settings screen (Server Config) where the user enters the VPS IP. The app then connects to:

| Purpose | URL format |
|---------|------------|
| REST API | `http://VPS_IP:8080/api/...` |
| WebSocket (chat) | `http://VPS_IP:8080` → nginx proxies `/socket.io/` to chat-service |

### Build the Android APK

1. Open `apps/broker-mobile` or `apps/customer-mobile` in Android Studio, **or** run:

```bash
cd apps/broker-mobile
npx react-native run-android --mode=release
# APK will be at android/app/build/outputs/apk/release/app-release.apk
```

2. Install the APK on a device and open it. Go to the **Server Config screen** and enter your VPS IP (e.g. `203.0.113.42`). The app adds `:8080` automatically.

> The default placeholder IP is `192.168.0.128` (local dev). Always update this to the VPS IP before distributing the APK.

---

## Useful Commands

### Logs

```bash
# All containers
docker compose logs -f

# Single service
docker compose logs -f auth-service
docker compose logs -f gateway
```

### Rebuild a single image after code changes

```bash
docker compose up -d --build auth-service
docker compose up -d --build customer-web
```

### Restart without rebuild

```bash
docker compose restart chat-service
```

### Stop everything

```bash
docker compose down
```

### Stop and delete all data (destructive)

```bash
docker compose down -v   # removes mysql_data and redis_data volumes
```

---

## Database

### Migrations

Migrations run automatically on first start via the MySQL `docker-entrypoint-initdb.d` mount:

```
shared/database/src/migrations/
  000_create_db_and_user.sql   — creates DB and user
  001_initial_schema.sql       — all 18 tables
  002_seed_data.sql            — seed/reference data
```

> This only runs when the `mysql_data` volume is **empty** (first time). On subsequent starts, the volume already has data so migrations are skipped.

### Manual database access

```bash
# Open MySQL shell inside the container
docker exec -it realestate_mysql mysql -u realestate -p realestate_db

# Run a migration manually
docker exec -i realestate_mysql mysql -u realestate -p realestate_db \
  < shared/database/src/migrations/001_initial_schema.sql
```

### Using the init script (from host)

```bash
# Requires mysql-client installed on the host
DB_HOST=VPS_IP DB_ROOT_USER=root DB_ROOT_PASSWORD=yourpassword bash scripts/db-init.sh
```

---

## Web App Build System

Web apps (admin-dashboard, broker-web, customer-web) use **Vite** with two env files:

| File | Used for | API URL |
|------|----------|---------|
| `.env` | Local development | `http://localhost/api` (through dev nginx) |
| `.env.production` | Docker production build | `/api` (relative — proxied by app's own nginx) |

Vite automatically picks `.env.production` during `npm run build`, so Docker images always get the correct relative URLs — no VPS IP needs to be hardcoded in the image.

---

## Adding a Domain Later

When you're ready to add a domain, the only changes needed are:

1. Point your domain's DNS A record to the VPS IP.
2. Update `nginx/nginx.conf` — add a `server_name your-domain.com;` and HTTPS config.
3. Add SSL certificates to `nginx/ssl/` (or use Certbot with a separate container).
4. Update `ALLOWED_ORIGINS` in each service's `.env` to include `https://your-domain.com`.
5. Update `docker-compose.yml` to expose port 443 on the gateway.
6. Rebuild and restart: `docker compose up -d --build gateway`.

---

## Technology Stack

### Backend
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **Database:** MySQL 8 (raw SQL, no ORM)
- **Cache:** Redis 7
- **Real-time:** Socket.IO
- **Auth:** JWT (access 15 min + refresh 30 d) + OTP via Twilio
- **Storage:** Cloudflare R2 (S3-compatible)
- **Notifications:** Firebase Admin SDK

### Frontend (Web)
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS + shadcn/ui (admin), custom (web apps)
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Forms:** React Hook Form + Zod

### Mobile
- **Framework:** React Native CLI 0.74
- **Navigation:** React Navigation v6
- **State:** Zustand + AsyncStorage
- **HTTP:** Axios
- **Maps:** React Native Maps (Google Maps)

### Infrastructure
- **Reverse proxy / API gateway:** nginx
- **Containerisation:** Docker + Docker Compose
- **Package manager:** npm workspaces (monorepo)

---

## API Endpoints Reference

All routes are accessed through the gateway at `http://VPS_IP:8080`.

### Auth (`/api/auth/`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/otp/send` | — | Send OTP to phone |
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login with OTP |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/auth/logout` | Bearer | Logout |
| GET | `/api/auth/profile` | Bearer | Get profile |

### Properties (`/api/properties/`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/properties` | — | Search (filters: type, price, area, location, bedrooms) |
| GET | `/api/properties/featured` | — | Featured listings |
| GET | `/api/properties/:id` | — | Property detail |
| POST | `/api/properties` | Broker | Create listing |
| PUT | `/api/properties/:id` | Broker | Update listing |
| DELETE | `/api/properties/:id` | Broker | Delete listing |
| PATCH | `/api/properties/:id/approve` | Admin | Approve listing |
| PATCH | `/api/properties/:id/reject` | Admin | Reject listing |
| POST | `/api/properties/:id/favorite` | Bearer | Toggle favorite |
| GET | `/api/properties/user/favorites` | Bearer | My favorites |

### Bookings (`/api/bookings/`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | Customer | Book a visit |
| GET | `/api/bookings` | Bearer | My bookings |
| PATCH | `/api/bookings/:id/confirm` | Broker | Confirm booking |
| PATCH | `/api/bookings/:id/cancel` | Bearer | Cancel booking |

### Chat (`/api/chats`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/chats` | Bearer | Get user's chats |
| POST | `/api/chats` | Customer | Start a chat with broker |
| GET | `/api/chats/:chatId/messages` | Bearer | Get messages |

### WebSocket Events (Socket.IO at `/socket.io/`)

```
Client → Server
  join_chat       { chatId }
  send_message    { chatId, type, content?, mediaUrl? }
  typing          { chatId }
  stop_typing     { chatId }
  mark_read       { chatId }

Server → Client
  new_message       Message object
  user_typing       { chatId, userId }
  user_stop_typing  { chatId, userId }
  messages_read     { chatId, readBy }
  chat_notification { chatId, message }
```

### Media (`/api/media/`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/media/upload/image` | Bearer | Upload image (max 10 MB) |
| POST | `/api/media/upload/video` | Bearer | Upload video (max 100 MB) |
| DELETE | `/api/media/:key` | Bearer | Delete file |

### Notifications (`/api/notifications/`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Bearer | Get notifications |
| PATCH | `/api/notifications/:id/read` | Bearer | Mark as read |
| POST | `/api/notifications/device-token` | Bearer | Register FCM token |

---

## Database Schema (18 tables)

| Table | Description |
|-------|-------------|
| `users` | All accounts — customers, brokers, admins |
| `brokers` | Broker profiles linked to users |
| `companies` | Real estate company profiles |
| `properties` | Listings (type, price, area, status) |
| `property_locations` | GPS coordinates + address |
| `property_images` | Images with WebP thumbnails (Cloudflare R2) |
| `property_videos` | Video uploads |
| `property_features` | Indoor/outdoor feature tags |
| `favorites` | Saved properties per user |
| `chats` | Chat rooms between customer ↔ broker |
| `messages` | Messages (text / image / voice / property card) |
| `bookings` | Visit and rental bookings |
| `notifications` | Push notification log |
| `subscription_plans` | Broker tier definitions |
| `subscriptions` | Active broker subscriptions |
| `payments` | Payment records |
| `advertisements` | Banner ad management |
| `reports` | User reports / complaints |

---

## Authentication Flow

```
1. User enters phone number
2. Server sends 6-digit OTP via Twilio SMS
3. User submits OTP (expires in 10 min, max 5 attempts)
4. Server returns { user, accessToken (15 min), refreshToken (30 d) }
5. Client stores tokens in AsyncStorage (mobile) or localStorage (web)
6. Every request attaches Authorization: Bearer <accessToken>
7. On 401 response, client auto-refreshes via POST /api/auth/refresh
```
