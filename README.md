# 🌿 Mower Repair Pro

A full-stack web application for managing a lawn mower repair business. Features a customer portal for tracking repairs and an admin dashboard for complete business management.

## Features

- **Customer Portal**: Submit repair requests, track job progress, view invoices, manage mower inventory
- **Admin Dashboard**: Manage customers, repair jobs, parts ordering, invoices, and revenue tracking
- **JWT Authentication**: Secure login with role-based access control (Customer / Admin)
- **Status Tracking**: Real-time job status updates with visual timeline
- **Invoice Management**: Create, send, and track payments with Stripe-ready architecture
- **Fully Containerized**: Docker + Docker Compose for one-command deployment

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite via Prisma ORM |
| Auth | JWT-based authentication |
| Containerization | Docker + Docker Compose |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Or: Node.js 18+ and npm for local development

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/halld243-tech/mower-repair-pro.git
cd mower-repair-pro

# Start all services
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Default Accounts

After first startup, the database is seeded with:

| Role | Email | Password |
|---|---|---|
| Admin | admin@mowerrepairpro.com | admin123 |
| Customer | john@example.com | customer123 |

> ⚠️ **Change these passwords in production!**

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `JWT_SECRET` | Secret key for JWT tokens | `change-this-secret-in-production` |
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe API key (future) | placeholder |

## Local Development (without Docker)

### Backend
```bash
cd server
cp ../.env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Database Migrations

```bash
# Push schema changes to database
cd server
npx prisma db push

# Run seed data
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user |

### Customers (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Customer detail |
| PUT | `/api/customers/:id` | Update customer |

### Mowers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/mowers` | Add mower |
| GET | `/api/mowers` | List mowers |
| GET | `/api/mowers/:id` | Mower detail |
| PUT | `/api/mowers/:id` | Update mower |

### Repair Jobs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Submit repair request |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id` | Job detail |
| PUT | `/api/jobs/:id` | Update job |

### Parts (Admin only for mutations)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/:jobId/parts` | Add part to job |
| GET | `/api/jobs/:jobId/parts` | List parts for job |
| PUT | `/api/parts/:id` | Update part |

### Invoices
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/:jobId/invoice` | Create invoice |
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/:id` | Invoice detail |
| PUT | `/api/invoices/:id` | Update invoice |

## Project Structure

```
mower-repair-pro/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # Customer pages
│   │   │   └── admin/       # Admin pages
│   │   ├── api.js           # Axios API client
│   │   ├── App.jsx          # Router + layout
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile           # Multi-stage build
│   └── nginx.conf           # Nginx config
├── server/                  # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed data
│   ├── src/
│   │   ├── middleware/       # Auth & validation
│   │   ├── routes/           # API route handlers
│   │   ├── lib/              # Prisma client
│   │   └── index.js          # Express server
│   └── Dockerfile
├── docker-compose.yml       # Service orchestration
├── .env.example             # Environment template
└── README.md
```

## Deployment (Render / Railway)

### Render
1. Create a new **Web Service** for the backend pointing to `server/`
2. Create a new **Static Site** for the frontend pointing to `client/`
3. Set build command: `npm install && npx vite build`
4. Set publish directory: `dist`
5. Add environment variables from `.env.example`

### Railway
1. Create a new project and connect your GitHub repo
2. Add two services: one for `server/` and one for `client/`
3. Configure environment variables
4. Deploy!

## License

ISC