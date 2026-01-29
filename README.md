# Truuth Document Portal

A full-stack document verification portal built with React, TypeScript, and NestJS. The portal enables applicants to upload and verify identity documents through the Truuth API.

**Live Demo:** https://truuth-frontend.vercel.app

## Architecture Overview

```
truuth-document-portal/
├── frontend/          # Next.js 14 React application
├── backend/           # NestJS API server (BFF layer)
├── docker/            # Docker Compose for local development
└── serverless.yml     # AWS Lambda deployment configuration
```

### Key Design Decisions

- **Backend for Frontend (BFF)**: All Truuth API credentials are securely stored server-side. The frontend communicates exclusively with our backend, never directly with Truuth APIs.
- **Serverless Ready**: The backend is structured for deployment on Vercel serverless functions or AWS Lambda.
- **Persistent Storage**: PostgreSQL database for tracking users, document submissions, and verification results.

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Lucide React Icons

### Backend
- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport.js

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Local Development Setup

### 1. Start PostgreSQL Database

```bash
cd docker
docker-compose up -d postgres
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your Truuth API credentials
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run start:dev
```

Backend runs at: http://localhost:3001

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at: http://localhost:3000

### Test Credentials

After seeding, use these accounts:
- `testuser` / `password123`
- `admin` / `admin123`

## API Documentation

Swagger documentation available at: http://localhost:3001/api/docs

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiration (e.g., "24h") |
| `TRUUTH_CLASSIFIER_URL` | Truuth Classifier API endpoint |
| `TRUUTH_VERIFY_BASE_URL` | Truuth Verify API base URL |
| `TRUUTH_TENANT_ALIAS` | Truuth tenant alias |
| `TRUUTH_API_KEY` | Truuth API key |
| `TRUUTH_API_SECRET` | Truuth API secret |

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## Deployment

### Vercel Deployment

Both frontend and backend are configured for Vercel deployment:

1. Deploy backend first to get the API URL
2. Set environment variables in Vercel dashboard
3. Deploy frontend with the backend URL

Backend uses Vercel's serverless functions via `vercel.json` configuration.

### AWS Lambda (Optional)

The `serverless.yml` in the project root defines the Lambda configuration:

```bash
npm install -g serverless
cd backend && npm run build
serverless deploy --stage production
```

## Project Structure

Detailed structure for each component:

### Frontend (`frontend/`)
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable UI components
- `src/context/` - React context providers
- `src/lib/` - API client and utilities
- `src/types/` - TypeScript type definitions

### Backend (`backend/`)
- `src/auth/` - Authentication module (JWT, Passport)
- `src/documents/` - Document upload and verification
- `src/truuth/` - Truuth API integration
- `src/users/` - User management
- `src/prisma/` - Database service
- `prisma/` - Schema and migrations

## Document Verification Flow

1. User uploads a document with type selection (Passport, Driver's Licence, Resume)
2. Backend validates file (type, size)
3. For ID documents: Classification API verifies document matches selected type
4. Document submitted to Truuth Verify API
5. Frontend polls for status updates
6. Results displayed with verification details

## Security

- All Truuth credentials stored server-side only
- JWT tokens with configurable expiration
- Passwords hashed with bcrypt (12 rounds)
- All document endpoints require authentication
- File validation for type and size limits

## License

Proprietary - All rights reserved.
