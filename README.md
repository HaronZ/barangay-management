# Barangay Management System

A full-stack web application for managing barangay residents, households, certificates, and services.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt + Email Verification
- **Security**: Helmet, Rate Limiting, CORS whitelist
- **Containerization**: Docker + Docker Compose

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- [PostgreSQL 16](https://www.postgresql.org/) (if running without Docker)

## Getting Started

### Option 1: Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd "Barangay Management"
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker exec -it barangay-api npx prisma migrate dev --name init
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

### Option 2: Manual Setup

1. **Start PostgreSQL** (ensure it's running on port 5432)

2. **Setup Backend:**
   ```bash
   cd backend
   cp .env.example .env   # Edit with your configuration
   npm install
   npx prisma generate
   npx prisma migrate dev
   npx tsx src/seed.ts    # (Optional) Seed test data
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, error handling, security
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities (JWT, validation)
│   │   ├── tests/             # Jest test suites
│   │   ├── app.ts             # Express app configuration
│   │   └── index.ts           # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── App.tsx            # Main app with routing
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user (sends verification email) | No |
| POST | `/api/auth/login` | Login (requires email verification) | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| POST | `/api/auth/verify-email` | Verify email with token | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### Persons/Residents (`/api/persons`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/persons` | List all persons (paginated) | Yes | Admin, Staff |
| GET | `/api/persons/:id` | Get person by ID | Yes | Admin, Staff |
| POST | `/api/persons` | Create new person | Yes | Admin, Staff |
| PUT | `/api/persons/:id` | Update person | Yes | Admin, Staff |
| DELETE | `/api/persons/:id` | Delete person | Yes | Admin |
| GET | `/api/persons/officials` | Get barangay officials | Yes | All |

### Households (`/api/households`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/households` | List all households | Yes | Admin, Staff |
| GET | `/api/households/:id` | Get household by ID | Yes | Admin, Staff |
| POST | `/api/households` | Create new household | Yes | Admin, Staff |
| PUT | `/api/households/:id` | Update household | Yes | Admin, Staff |
| DELETE | `/api/households/:id` | Delete household | Yes | Admin |

### Certificates (`/api/certificates`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/certificates` | List all certificates | Yes | All |
| GET | `/api/certificates/:id` | Get certificate by ID | Yes | All |
| GET | `/api/certificates/resident/:id` | Get certificates by resident | Yes | All |
| POST | `/api/certificates` | Request new certificate | Yes | All |
| PATCH | `/api/certificates/:id/status` | Update certificate status | Yes | Admin, Staff |

### Blotters (`/api/blotters`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/blotters` | List all blotter records | Yes | Admin, Staff |
| GET | `/api/blotters/:id` | Get blotter by ID | Yes | Admin, Staff |
| POST | `/api/blotters` | Create blotter record | Yes | Admin, Staff |
| PATCH | `/api/blotters/:id/status` | Update blotter status | Yes | Admin, Staff |

### Users (`/api/users`) - Admin Only

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users` | List all users | Yes | Admin |
| POST | `/api/users` | Create new user | Yes | Admin |
| PATCH | `/api/users/:id/role` | Update user role | Yes | Admin |
| PATCH | `/api/users/:id/status` | Toggle user active status | Yes | Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Admin |

### Appointments (`/api/appointments`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/appointments` | List appointments | Yes | All |
| POST | `/api/appointments` | Book appointment | Yes | All |
| PATCH | `/api/appointments/:id/status` | Update status | Yes | Admin, Staff |

### Complaints (`/api/complaints`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/complaints` | List complaints | Yes | All |
| POST | `/api/complaints` | File complaint | Yes | All |
| PATCH | `/api/complaints/:id/status` | Update status | Yes | Admin, Staff |

### Announcements (`/api/announcements`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/announcements` | List announcements | Yes | All |
| POST | `/api/announcements` | Create announcement | Yes | Admin, Staff |
| PUT | `/api/announcements/:id` | Update announcement | Yes | Admin, Staff |
| DELETE | `/api/announcements/:id` | Delete announcement | Yes | Admin |

### Messages (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages` | Get user's messages | Yes |
| POST | `/api/messages` | Send message | Yes |

### Analytics (`/api/analytics`) - Admin/Staff Only

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard` | Dashboard statistics | Yes |
| GET | `/api/analytics/certificates` | Certificate analytics | Yes |
| GET | `/api/analytics/demographics` | Resident demographics | Yes |

### Tracking (`/api/tracking`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tracking/:controlNumber` | Track request by control number | No |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barangay_db

# JWT Configuration
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email (SMTP) - Required for email verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="Barangay Management <your-email@gmail.com>"

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## Security Features

- **Helmet**: Sets secure HTTP headers
- **Rate Limiting**: 100 requests/15min (general), 5 attempts/15min (auth)
- **CORS**: Whitelist-based origin validation
- **JWT**: Token-based authentication with expiry
- **bcrypt**: Password hashing (10 rounds)
- **Email Verification**: Required before login
- **Input Validation**: Zod schema validation
- **Prisma ORM**: SQL injection protection

## User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all features including user management |
| **STAFF** | Manage residents, certificates, households, blotters |
| **RESIDENT** | View own profile, request certificates, file complaints |

## Testing

```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

## License

MIT
