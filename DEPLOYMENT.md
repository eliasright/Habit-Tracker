# Deployment Guide - Habit Tracker

## Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + Google OAuth (Passport.js)

---

## 🚀 Development Mode

### Prerequisites
- Node.js 20+
- PostgreSQL running (via Docker or local)

### Setup

1. **Install dependencies** (installs for both frontend + backend):
```bash
npm install
```

2. **Copy environment variables**:
```bash
cp .env.example .env
```

3. **Configure your .env** with Google OAuth credentials and database URL

4. **Run database migrations**:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### Run Development Server

**Option 1: Run both frontend + backend with one command** (Recommended):
```bash
npm run dev
```
This uses `concurrently` to run:
- Frontend: `http://localhost:5174` (Vite dev server with HMR)
- Backend: `http://localhost:3011` (Nodemon with auto-reload)

**Option 2: Run separately**:
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

### How Dev Mode Works
- Frontend runs on Vite dev server (`:5174`)
- Backend runs on Express (`:3011`)
- Vite **proxies** `/api` requests to backend (no CORS issues!)
- Both packages load from **single `.env` at root**

**Note:** Port 3011 is used to avoid conflicts with other apps in Coolify.

---

## 🐳 Docker Development (Optional)

If you prefer Docker for development:

```bash
npm run docker:dev
```

This runs the **old setup** with separate containers. Most developers will prefer `npm run dev` for faster iteration.

---

## 📦 Production Deployment to Coolify

### The New Architecture

**Before (Old - Required 2 Domains):**
```
Frontend Container (Nginx) → time.eliasright.dev
Backend Container (Express) → backend-time.eliasright.dev
PostgreSQL Container
```

**After (New - Only 1 Domain!):**
```
App Container (Express) → time.eliasright.dev
  ├── /api/* → Backend API
  └── /* → React SPA (served as static files)
PostgreSQL Container
```

### Deployment Steps

#### 1. Update `.env.production`

```env
# ==============================================
# PRODUCTION CONFIGURATION
# ==============================================
NODE_ENV=production
PORT=3011
CORS_ORIGIN=https://time.eliasright.dev

# Database (Coolify provides this)
DATABASE_URL="postgresql://user:password@db-host:5432/habit_tracker"

# JWT Secret (keep your existing one)
JWT_SECRET=your-production-secret-here

# Google OAuth - IMPORTANT: Update callback URL!
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://time.eliasright.dev/api/auth/google/callback

# Frontend URL (same as backend now!)
FRONTEND_URL=https://time.eliasright.dev

# Frontend config
VITE_API_URL=https://time.eliasright.dev
```

**Key Changes:**
- `GOOGLE_CALLBACK_URL` changed from `backend-time.eliasright.dev` to just `time.eliasright.dev/api/auth/google/callback`
- Update this in Google Cloud Console: https://console.cloud.google.com/apis/credentials

#### 2. Push to Git

```bash
git add .
git commit -m "Upgrade to single-container deployment architecture"
git push origin main
```

#### 3. Configure Coolify

**Option A: New Deployment (Recommended)**

1. Create new app in Coolify
2. Connect your GitHub repo
3. Set **Build Pack**: Docker
4. Coolify will auto-detect the root `Dockerfile`
5. Set domain: `time.eliasright.dev`
6. **Set port mapping**: `3011` (important - different from your Vue app!)
7. Add environment variables from `.env.production`
8. Add PostgreSQL database service
9. Deploy!

**Option B: Update Existing Deployment**

1. **Delete the old frontend service** (you don't need it anymore!)
2. Update backend service:
   - Change domain from `backend-time.eliasright.dev` to `time.eliasright.dev`
   - Update build context to root directory (not `backend/`)
   - Point to root `Dockerfile`
   - Update environment variables
3. Deploy!

#### 4. Verify Deployment

- Visit `https://time.eliasright.dev` → Should show React app
- Visit `https://time.eliasright.dev/health` → Should return `{"status":"ok"}`
- Visit `https://time.eliasright.dev/api/auth/google` → Should redirect to Google OAuth

---

## 🔧 Build Commands

### Local Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

This:
1. Builds React app to `frontend/dist/`
2. Compiles TypeScript backend to `backend/dist/`
3. Starts Express server which serves both API + static frontend

### Docker Production Build

```bash
docker build -t habit-tracker .
docker run -p 3011:3011 --env-file .env.production habit-tracker
```

Visit `http://localhost:3011` to test.

---

## 📂 Project Structure

```
Habit-Tracker/
├── frontend/               # React + Vite
│   ├── src/
│   ├── dist/              # Build output (served by Express in prod)
│   ├── package.json
│   └── vite.config.ts     # Proxies /api to backend in dev
├── backend/               # Express + Prisma
│   ├── src/
│   │   └── index.ts       # Serves API + static frontend in prod
│   ├── dist/              # Compiled TypeScript
│   ├── prisma/
│   └── package.json
├── .env                   # Single source of truth (root)
├── .env.production        # Production overrides
├── package.json           # Root workspace config
├── Dockerfile             # Multi-stage build (frontend + backend)
└── docker-compose.yml     # Orchestrates app + postgres
```

---

## 🎯 Key Differences from Old Setup

| Aspect | Old | New |
|--------|-----|-----|
| **Containers** | 3 (frontend, backend, db) | 2 (app, db) |
| **Domains** | 2 required | 1 required |
| **Frontend Server** | Nginx | Express (serves static) |
| **CORS** | Required | Not needed (same origin) |
| **Dev Mode** | Docker Compose | npm workspaces + concurrently |
| **Environment** | Multiple .env files | Single .env at root |
| **Build** | 2 Dockerfiles per service | 1 Dockerfile at root |
| **Deployment** | Complex domain mapping | Simple single-service |

---

## 🐛 Troubleshooting

### Frontend shows 404 in production
- Make sure `NODE_ENV=production` is set
- Verify `frontend/dist/` exists after build
- Check backend logs: `app.use(express.static(...))` path is correct

### API calls fail in dev mode
- Verify Vite proxy is configured in `frontend/vite.config.ts`
- Backend must be running on port 3011
- Check browser console for proxy errors

### Google OAuth fails
- Update callback URL in Google Cloud Console
- Must match `GOOGLE_CALLBACK_URL` in .env
- In production: `https://time.eliasright.dev/api/auth/google/callback`

### Sessions not persisting
- Check `/tmp/sessions` directory exists in container
- Verify `JWT_SECRET` is set
- Check cookie settings (secure flag requires HTTPS)

---

## 📝 Environment Variables Reference

### Required for All Environments
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWTs (generate at https://jwtsecrets.com/)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### Development-Specific
- `NODE_ENV=development`
- `PORT=3011`
- `CORS_ORIGIN=http://localhost:5174`
- `GOOGLE_CALLBACK_URL=http://localhost:3011/api/auth/google/callback`
- `FRONTEND_URL=http://localhost:5174`
- `VITE_API_URL=http://localhost:3011`

### Production-Specific
- `NODE_ENV=production`
- `PORT=3011`
- `CORS_ORIGIN=https://time.eliasright.dev`
- `GOOGLE_CALLBACK_URL=https://time.eliasright.dev/api/auth/google/callback`
- `FRONTEND_URL=https://time.eliasright.dev`
- `VITE_API_URL=https://time.eliasright.dev`

---

## 🎉 Success!

You now have a **production-ready monorepo** with:
- ✅ Single container deployment
- ✅ No domain mapping bullshit
- ✅ Fast dev mode with HMR
- ✅ Persistent sessions
- ✅ Shared dependencies
- ✅ Clean architecture

**For Coolify:** Just point one domain to port 3011 and you're done! 🚀
