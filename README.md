# Habit Tracker

I'm making this habit tracking app because I want to improve my bad habits, and I like using timers. Building this for myself.

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS

**Backend:** Node.js, Express, TypeScript, Prisma ORM

**Database:** PostgreSQL

**Auth:** JWT, Google OAuth

**DevOps:** Docker, Docker Compose

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+ (optional, for local development)

### Running with Docker (Recommended)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd habit-tracker
```

2. Start all services:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on `localhost:5432`
- Backend API on `http://localhost:3001`
- Frontend app on `http://localhost:5173`

### Common Docker Commands

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop everything
docker-compose down

# Stop and remove volumes (deletes DB data!)
docker-compose down -v

# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev

# Generate Prisma Client
docker-compose exec backend npx prisma generate

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U postgres -d habit_tracker
```

## Development

### Backend Development

The backend uses hot reload via nodemon. Any changes to `.ts` files will automatically restart the server.

Location: `backend/src/`

### Frontend Development

The frontend uses Vite's hot module replacement. Changes are reflected instantly.

Location: `frontend/src/`

### Database Migrations

```bash
# Create a new migration
docker-compose exec backend npx prisma migrate dev --name migration_name

# Apply migrations
docker-compose exec backend npx prisma migrate deploy

# Reset database
docker-compose exec backend npx prisma migrate reset
```

## Project Structure

```
habit-tracker/
├── docker-compose.yml          # Container orchestration
├── .gitignore
├── README.md
│
├── backend/                    # Express API
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── src/
│       ├── index.ts            # Entry point
│       ├── routes/             # API routes
│       ├── controllers/        # Request handlers
│       └── middleware/         # Custom middleware
│
└── frontend/                   # React app
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── components/
        └── pages/
```

## Environment Variables

Backend (.env):
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/habit_tracker
NODE_ENV=development
PORT=3001
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:3001
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT
