# Environment and Deployment Notes

Use placeholder values only in shared docs. Never commit real secrets.

## Backend Environment Placeholder

Create `server/.env` locally with values like:

```dotenv
NODE_ENV="development"
PORT="5000"
CORS_ORIGIN="http://localhost:5173"

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

JWT_ACCESS_SECRET="replace-with-local-access-secret"
JWT_REFRESH_SECRET="replace-with-local-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

CLOUDINARY_CLOUD_NAME="replace-with-cloud-name"
CLOUDINARY_API_KEY="replace-with-api-key"
CLOUDINARY_API_SECRET="replace-with-api-secret"

KHALTI_SECRET_KEY="replace-with-khalti-secret"
KHALTI_PUBLIC_KEY="replace-with-khalti-public-key"
KHALTI_VERIFY_URL="https://example.test/khalti/verify"

ESEWA_MERCHANT_CODE="replace-with-esewa-merchant-code"
ESEWA_SECRET_KEY="replace-with-esewa-secret"
ESEWA_VERIFY_URL="https://example.test/esewa/verify"

PAYMENT_SUCCESS_URL="http://localhost:5173/payment/success"
PAYMENT_FAILURE_URL="http://localhost:5173/payment/failure"
```

The exact variable names should match `server/src/config/*.ts`.

## Local Setup

Install dependencies:

```powershell
npm install
```

Generate Prisma client:

```powershell
npm run server:prisma:generate
```

Build backend:

```powershell
npm run server:build
```

Run backend:

```powershell
npm run server:dev
```

Health check:

```powershell
Invoke-RestMethod -Method GET "http://localhost:5000/api/health"
```

## Database Notes

- PostgreSQL is required.
- Do not run migrations against production without backup and approval.
- Do not store real database URLs in docs, screenshots, tickets, or request collections.
- Prisma schema changes are not part of Sprint 17.

## Deployment Checklist

- Configure production environment variables in the hosting provider secret manager.
- Set `NODE_ENV="production"`.
- Set a production `CORS_ORIGIN`.
- Use strong JWT secrets.
- Configure PostgreSQL connection pooling if needed.
- Configure Cloudinary credentials before enabling uploads.
- Configure Khalti/eSewa merchant credentials before live payment testing.
- Run backend build before deployment.
- Verify `/api/health`.
- Verify admin-only routes reject customer tokens.
- Verify no real secrets are printed in logs.

## Security Notes

- Do not expose `passwordHash`.
- Do not expose JWT secrets.
- Do not expose database URLs or Supabase passwords.
- Do not expose Cloudinary API secrets.
- Do not expose Khalti/eSewa keys.
- Do not commit `.env`.
- Do not include real access or refresh tokens in docs or Postman collections.
