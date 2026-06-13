# The AMY Shop Frontend

React, TypeScript, Vite, and Tailwind CSS frontend foundation for The AMY Shop.

## Setup

Create a local `.env` from `.env.example` and point it at the backend API:

```env
VITE_API_URL="http://localhost:5000"
```

## Scripts

```powershell
npm run client:dev
npm run client:build
```

## Foundation

- Routing is defined in `src/app/router.tsx`.
- Global providers live in `src/app/providers.tsx`.
- API base configuration lives in `src/config/env.ts` and `src/lib/apiClient.ts`.
- Auth token storage is centralized in `src/lib/authStorage.ts`.
- Auth state is managed by `src/context/AuthContext.tsx`.
- Reusable layout shells live in `src/components/layout`.
- Reusable UI primitives live in `src/components/ui`.
- Backend API services are grouped by module in `src/services`.

## Routes

- Public: `/`, `/products`, `/products/:slug`, `/login`, `/register`
- Customer: `/account`, `/cart`, `/checkout`, `/orders`
- Admin: `/admin`, `/admin/products`, `/admin/orders`, `/admin/customers`

The Sprint 18 pages are polished placeholders only. Business workflows, payment UI,
image upload UI, and full admin CRUD screens are reserved for later sprints.
