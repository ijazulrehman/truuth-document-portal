# Truuth Frontend

Next.js frontend for the Truuth Document Verification Portal.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Update `.env` with your backend API URL.

### Development

Start the development server:
```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Features

### Login Page (`/login`)
- Username/password authentication
- JWT token storage in localStorage
- Auto-redirect to dashboard if already logged in

### Dashboard (`/dashboard`)
- View all uploaded documents
- Real-time status updates (auto-polls every 5 seconds for processing documents)
- Document cards showing:
  - File name and type
  - Current status with visual badge
  - Upload date/time
  - Action buttons (Check Status / View Result)

### Document Upload
- Modal-based upload flow
- Document type selection (Passport, Driver's Licence, Resume)
- File validation (max 10MB, JPEG/PNG/PDF only)
- Real-time upload progress
- Success/error feedback

### Result Modal
- Verification status (Passed/Failed)
- Confidence score with progress bar
- Individual check results
- Extracted data display (if available)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with AuthProvider
│   │   ├── page.tsx         # Home (redirects)
│   │   ├── globals.css      # Global styles
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   └── dashboard/
│   │       └── page.tsx     # Dashboard page
│   ├── components/
│   │   ├── Header.tsx       # Navigation header
│   │   ├── DocumentCard.tsx # Document list item
│   │   ├── DocumentUpload.tsx # Upload modal
│   │   ├── ResultModal.tsx  # Verification result modal
│   │   └── StatusBadge.tsx  # Status indicator
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state
│   ├── lib/
│   │   └── api.ts           # API client
│   └── types/
│       └── index.ts         # TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Document Status Flow

```
PENDING -> CLASSIFYING -> SUBMITTED -> PROCESSING -> DONE
                |                          |
        CLASSIFICATION_FAILED            FAILED
```

## Authentication Flow

1. User enters credentials on `/login`
2. Backend validates credentials and returns JWT
3. Token stored in localStorage
4. User redirected to dashboard
5. Token attached to all API requests

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
