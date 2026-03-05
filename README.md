# LOFIVE — Subscription Management SaaS

A production-ready subscription management platform built with Node.js, React, and PostgreSQL. Features complete subscription lifecycle, payment processing, admin dashboard, and role-based access control.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## Features

- **Authentication** — JWT-based auth with bcrypt hashing, role-based access (USER / ADMIN)
- **Subscription lifecycle** — PENDING → ACTIVE → CANCELED/FAILED with auto-renewal support
- **Payment processing** — Mock gateway with webhook callbacks and atomic transaction safety
- **Admin dashboard** — Revenue analytics, user/plan/subscription/payment management
- **Race condition protection** — Serializable transactions + partial unique DB indexes
- **14-page SPA** — Dark theme, Vietnamese UI, Spotify Premium-inspired design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, TypeScript |
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (jsonwebtoken), bcrypt |
| Deployment | Docker Compose (PostgreSQL + Backend + Nginx) |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── modules/          # auth, users, plans, subscriptions, payments
│   │   ├── common/           # middleware, errors, utils
│   │   ├── database/         # Prisma client singleton
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Entry point
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── seed.ts           # Seed data
│
├── frontend/
│   └── src/
│       ├── components/       # Button, Card, Badge, Input, etc.
│       ├── pages/            # 14 pages (landing, auth, dashboard, admin...)
│       ├── services/         # API service modules
│       ├── contexts/         # AuthContext
│       ├── hooks/            # useDocumentTitle, etc.
│       └── types/            # TypeScript interfaces
│
├── docs/                     # API spec, DB design, architecture
├── tests/                    # E2E test scripts + .http files
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env          # Edit with your DB credentials
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@subscription.com | Admin123! |
| User | user@test.com | Test123! |

---

## API Endpoints (26 total)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Current user |

### Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/plans` | List plans |
| GET | `/api/v1/plans/:id` | Plan detail |
| POST | `/api/v1/plans` | Create (admin) |
| PUT | `/api/v1/plans/:id` | Update (admin) |
| DELETE | `/api/v1/plans/:id` | Soft delete (admin) |
| GET | `/api/v1/plans/:id/stats` | Plan stats (admin) |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/subscriptions` | Subscribe |
| GET | `/api/v1/subscriptions/my` | My subscriptions |
| GET | `/api/v1/subscriptions/:id` | Detail |
| POST | `/api/v1/subscriptions/:id/cancel` | Cancel |
| POST | `/api/v1/subscriptions/:id/renew` | Renew |
| PUT | `/api/v1/subscriptions/:id/auto-renew` | Toggle auto-renew |
| GET | `/api/v1/subscriptions` | All (admin) |
| POST | `/api/v1/subscriptions/:id/activate` | Activate (admin) |
| PUT | `/api/v1/subscriptions/:id/status` | Update status (admin) |
| GET | `/api/v1/subscriptions/stats/overview` | Stats (admin) |
| POST | `/api/v1/subscriptions/maintenance/check-expired` | Check expired (admin) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments` | Create payment |
| GET | `/api/v1/payments/my` | My payments |
| GET | `/api/v1/payments/:id` | Detail |
| POST | `/api/v1/payments/:id/simulate` | Simulate processing |
| POST | `/api/v1/payments/:id/webhook` | Webhook callback |
| GET | `/api/v1/payments` | All (admin) |
| GET | `/api/v1/payments/stats/overview` | Stats (admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/v1/users/profile` | Update profile |
| PUT | `/api/v1/users/password` | Change password |
| GET | `/api/v1/users` | All users (admin) |
| GET | `/api/v1/users/:id` | User detail (admin) |
| PUT | `/api/v1/users/:id/role` | Change role (admin) |
| DELETE | `/api/v1/users/:id` | Delete user (admin) |
| GET | `/api/v1/users/stats/overview` | Stats (admin) |

---

## Docker Deployment

```bash
cp .env.example .env    # Edit with production values
docker-compose up -d --build
```

Services: PostgreSQL (5432) → Backend (5000) → Frontend/Nginx (80)

---

## Documentation

- [API Specification](docs/API_SPECIFICATION.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Project State](docs/PROJECT_STATE.md)

---

## License

MIT
