# SmartLeads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript.

## Tech Stack

**Frontend:** React 18, TypeScript, TailwindCSS, React Hot Toast, Lucide React  
**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose  
**Auth:** JWT + bcryptjs  
**DevOps:** Docker, Docker Compose

## Features

- JWT-based authentication with role-based access control (Admin / Sales)
- Full CRUD for leads with status and source tracking
- Advanced filtering: status, source, debounced search, sort — all composable
- Backend pagination (10 records/page) with metadata
- CSV export (scoped by role)
- Aggregate dashboard stats via dedicated `/stats` endpoint
- Responsive UI with dark mode support
- Loading skeletons, empty states, and error handling throughout

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # DB and JWT config
│   │   ├── controllers/     # Route handlers (auth, lead + stats)
│   │   ├── middleware/      # Auth (protect + authorize), validation, error handler
│   │   ├── models/          # Mongoose models (User, Lead)
│   │   ├── routes/          # Express routers
│   │   ├── types/           # TypeScript interfaces & types
│   │   ├── utils/           # Centralized response helpers
│   │   ├── validators/      # express-validator rule sets
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + typed API calls (auth, leads+stats)
│   │   ├── components/
│   │   │   ├── layout/      # Navbar with dark mode toggle
│   │   │   ├── leads/       # LeadTable, LeadForm (with phone), LeadFilters, Pagination
│   │   │   └── ui/          # Badge, Button, Input, Modal, Select
│   │   ├── context/         # AuthContext (login, register, logout)
│   │   ├── hooks/           # useLeads, useDebounce
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage
│   │   ├── types/           # Shared TypeScript types
│   │   └── App.tsx          # Root with dark mode state
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml
├── API_DOCS.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or Docker

---

### Option A — Local Development

**1. Backend setup**
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and a strong JWT_SECRET
npm install
npm run dev
# Runs on http://localhost:5000
```

**2. Frontend setup**
```bash
cd frontend
cp .env.example .env
# VITE_API_URL defaults to /api via nginx proxy; for local dev set it to http://localhost:5000/api
npm install
npm run dev
# Runs on http://localhost:5173
```

---

### Option B — Docker Compose (Recommended)

```bash
# From project root
cp backend/.env.example backend/.env
# Edit JWT_SECRET in backend/.env

docker-compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173         |
| Backend   | http://localhost:5000         |
| MongoDB   | mongodb://localhost:27017     |

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```
> In production via Docker, the nginx proxy handles routing so `/api` works without the full URL.

---

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for full endpoint reference including request/response shapes and role-based access rules.

## Role-Based Access

| Action          | Admin | Sales (own leads only) |
|-----------------|-------|------------------------|
| View leads      | All   | Own                    |
| Create lead     | ✅    | ✅                     |
| Edit lead       | ✅    | ✅ (own)               |
| Delete lead     | ✅    | ❌                     |
| Export CSV      | All   | Own                    |
| Dashboard stats | All   | Own                    |

## Git Commit Convention

```
feat: add stats endpoint and dashboard aggregate cards
fix: scope stats by role for sales users
chore: add phone field to Lead model and form
docs: add full API documentation
```

## Author

Built for the ServiceHive Full Stack Internship Assignment.
