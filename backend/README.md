# Truuth Document Portal - Backend

NestJS Backend for the Applicant Document Submission Portal.

## Tech Stack

- **Framework**: NestJS 10 (Express-based)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport.js
- **Validation**: class-validator
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Start PostgreSQL with Docker

```bash
cd ../docker
docker-compose up -d postgres
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Update `.env` with your Truuth API credentials.

### 4. Run Database Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Seed Test Data

```bash
npm run db:seed
```

This creates test users:
- Username: `testuser` / Password: `password123`
- Username: `admin` / Password: `admin123`

### 6. Start Development Server

```bash
npm run start:dev
```

Server runs at: http://localhost:3001

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with credentials |
| POST | /api/auth/logout | Logout current user |
| GET | /api/auth/me | Get current user profile |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/documents/upload | Upload document for verification |
| GET | /api/documents | Get all user documents |
| GET | /api/documents/poll | Poll for status updates |
| GET | /api/documents/:id/result | Get verification result |
| DELETE | /api/documents/:id | Delete a document |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/health/ready | Readiness probe |
| GET | /api/health/live | Liveness probe |

## API Documentation

Swagger documentation is available at:
http://localhost:3001/api/docs

## Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry
│   ├── app.module.ts           # Root module
│   ├── common/                 # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Response interceptors
│   │   └── interfaces/         # Shared interfaces
│   ├── config/                 # Configuration
│   ├── prisma/                 # Prisma module
│   ├── auth/                   # Authentication module
│   ├── users/                  # Users module
│   ├── documents/              # Documents module
│   ├── truuth/                 # Truuth API integration
│   └── health/                 # Health check module
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
└── test/                       # E2E tests
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run db:seed` | Seed database |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (development/production) |
| `PORT` | Server port (default: 3001) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiration time |
| `TRUUTH_CLASSIFIER_URL` | Truuth Classifier API URL |
| `TRUUTH_VERIFY_URL` | Truuth Verify API URL |
| `TRUUTH_USERNAME` | Truuth API username |
| `TRUUTH_PASSWORD` | Truuth API password |

## Security Notes

- All Truuth credentials are stored server-side only
- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt (12 rounds)
- All endpoints (except health and login) require authentication
- File uploads are validated for type and size

## Deployment

### Vercel

The backend can be deployed to Vercel serverless functions.

### AWS Lambda

Use the `serverless.yml` in the project root for AWS Lambda deployment.
