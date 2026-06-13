# The AMY Shop

The AMY Shop is a professional PERN stack e-commerce platform for a handmade custom gift shop.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Payments: Khalti, eSewa, Cash on Delivery
- Image storage: Cloudinary

## Project Structure

```text
theamyshop/
  docs/
  client/
  server/
  postman/
  AGENTS.md
  README.md
  package.json
  .gitignore
```

## Backend Status

The backend API includes core modules for authentication, account/profile, addresses, products, categories, cart, checkout, orders, payments, coupons, customizations, gift options, reviews, rewards, referrals, customers, uploads, and admin dashboard analytics.

Frontend implementation is pending.

## Documentation

- [API route inventory](docs/api-route-inventory.md)
- [Backend API reference](docs/17-backend-api-reference.md)
- [Backend testing guide](docs/18-backend-testing-guide.md)
- [Environment and deployment notes](docs/19-environment-and-deployment-notes.md)
- [Known limitations and next steps](docs/20-known-limitations-and-next-steps.md)

## Scripts

```bash
npm run client:dev
npm run client:build
npm run server:dev
npm run server:build
```

## Safety Notes

Never commit real `.env` values, JWT secrets, database URLs, Cloudinary credentials, Khalti/eSewa keys, payment secrets, or real access tokens.
