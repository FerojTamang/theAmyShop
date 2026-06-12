# Implementation Roadmap and Folder Structure

# The AMY Shop — Handmade Custom Gift E-Commerce Platform

## 1. Purpose

This document defines how The AMY Shop will be implemented after documentation and system design.

The project will follow professional SDLC and sprint-based development.

Tech stack:

```txt
Frontend: React + TypeScript + Vite + Tailwind CSS
Backend: Node.js + Express + TypeScript
Database: PostgreSQL
ORM: Prisma
Payment: Khalti, eSewa, Cash on Delivery
Image Storage: Cloudinary
```

---

## 2. Development Strategy

The project will be built sprint by sprint.

Correct order:

```txt
Sprint 0: Project setup
Sprint 1: Backend foundation
Sprint 2: Database schema
Sprint 3: Authentication and authorization
Sprint 4: Product and category module
Sprint 5: Cart module
Sprint 6: Customization and image upload
Sprint 7: Gift message module
Sprint 8: Coupon module
Sprint 9: Checkout and order module
Sprint 10: Payment module
Sprint 11: Reward/gems module
Sprint 12: Referral module
Sprint 13: Admin dashboard
Sprint 14: Customer frontend UI
Sprint 15: Admin frontend UI
Sprint 16: Testing
Sprint 17: Deployment
```

---

## 3. Root Folder Structure

The project should use this structure:

```txt
theamyshop/
│
├── docs/
│   ├── 07-erd-database-design.md
│   └── 13-implementation-roadmap-and-folder-structure.md
│
├── client/
│
├── server/
│
├── AGENTS.md
├── README.md
├── package.json
└── .gitignore
```

---

## 4. Backend Folder Structure

The backend should follow this structure:

```txt
server/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── cloudinary.ts
│   │   └── payment.ts
│   │
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── orderStatus.ts
│   │   ├── paymentStatus.ts
│   │   ├── rewardRules.ts
│   │   └── messages.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── addresses/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── cart/
│   │   ├── customizations/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── coupons/
│   │   ├── rewards/
│   │   ├── referrals/
│   │   ├── reviews/
│   │   ├── uploads/
│   │   └── admin/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── notFound.middleware.ts
│   │
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── generateSlug.ts
│   │   ├── generateOrderNumber.ts
│   │   ├── generateReferralCode.ts
│   │   ├── hashPassword.ts
│   │   └── calculateOrderTotal.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 5. Frontend Folder Structure

The frontend should follow this structure:

```txt
client/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── admin/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── rewards/
│   │   ├── referrals/
│   │   └── admin/
│   │
│   ├── pages/
│   │   ├── public/
│   │   ├── customer/
│   │   └── admin/
│   │
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   └── main.tsx
│
├── .env
├── .env.example
├── package.json
└── vite.config.ts
```

---

## 6. Sprint 0: Project Setup

Goal:

```txt
Create base project structure.
```

Tasks:

```txt
- Create root folder
- Initialize Git
- Create docs folder
- Create client React TypeScript app
- Create server Express TypeScript app
- Install required dependencies
- Setup root package scripts
- Setup .gitignore
- Setup README
```

---

## 7. Sprint 1: Backend Foundation

Goal:

```txt
Create basic Express backend.
```

Tasks:

```txt
- Create app.ts
- Create server.ts
- Setup Express
- Setup CORS
- Setup Helmet
- Setup dotenv/env config
- Setup Prisma client file
- Setup health route
- Setup ApiResponse
- Setup ApiError
- Setup asyncHandler
- Setup global error middleware
- Setup not found middleware
```

Expected endpoint:

```txt
GET /api/health
```

---

## 8. Sprint 2: Database Schema

Goal:

```txt
Create Prisma schema based on ERD.
```

Tasks:

```txt
- Create Prisma enums
- Create Prisma models
- Create model relations
- Add unique constraints
- Add indexes
- Run prisma generate
- Run migration only after DATABASE_URL is configured
```

Important:

```txt
Do not implement API routes in Sprint 2.
Do not implement auth in Sprint 2.
Do not implement frontend in Sprint 2.
```

---

## 9. Sprint 3: Authentication and Authorization

Goal:

```txt
Create secure auth system.
```

Tasks:

```txt
- Register customer
- Login customer/admin
- Hash password
- Generate JWT
- Create auth middleware
- Create role middleware
- Create current user route
- Create reward wallet during registration
- Create referral code during registration
- Handle referral code during registration
```

APIs:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
GET /api/auth/me
```

---

## 10. Sprint 4: Product and Category Module

Goal:

```txt
Build product browsing and admin product management.
```

Tasks:

```txt
- Create category APIs
- Create product APIs
- Product search
- Product filters
- Product slug
- Admin create product
- Admin update product
- Admin deactivate product
```

---

## 11. Sprint 5: Cart Module

Goal:

```txt
Build customer cart.
```

Tasks:

```txt
- Get cart
- Add product to cart
- Update quantity
- Remove item
- Clear cart
- Validate product availability
- Store price snapshot
```

---

## 12. Sprint 6: Customization and Image Upload

Goal:

```txt
Build handmade customization workflow.
```

Tasks:

```txt
- Upload reference image
- Create customization request
- Link customization to cart/order item
- Admin view customization requests
- Admin update customization status
```

---

## 13. Sprint 7: Gift Message Module

Goal:

```txt
Build gift message printing workflow.
```

Tasks:

```txt
- Add gift message during checkout
- Save receiver name
- Save sender name
- Save gift message
- Save gift wrapping option
- Admin view gift messages
- Admin mark printed
- Admin mark attached
```

---

## 14. Sprint 8: Coupon Module

Goal:

```txt
Build coupon system.
```

Tasks:

```txt
- Create coupon
- Validate coupon
- Apply percentage discount
- Apply fixed discount
- Apply free shipping
- Apply free gift wrapping
- Track coupon redemption
- Enforce usage limits
```

---

## 15. Sprint 9: Checkout and Order Module

Goal:

```txt
Create secure order flow.
```

Tasks:

```txt
- Fetch cart
- Validate product stock
- Recalculate product price
- Validate coupon
- Validate gems
- Add customization fee
- Add gift wrapping fee
- Add shipping fee
- Create order
- Create order items
- Clear cart
```

Important:

```txt
Use database transaction during checkout.
Never trust frontend total.
```

---

## 16. Sprint 10: Payment Module

Goal:

```txt
Integrate payment methods.
```

Tasks:

```txt
- Khalti payment initiation
- Khalti verification
- eSewa payment initiation
- eSewa verification
- COD support
- Save payment logs
- Prevent duplicate verification
```

Important:

```txt
Frontend success page is not proof of payment.
Backend must verify payment.
```

---

## 17. Sprint 11: Reward/Gems Module

Goal:

```txt
Build customer loyalty system.
```

Tasks:

```txt
- Get reward wallet
- Get reward history
- Validate gems redemption
- Deduct gems when used
- Add gems after delivery
- Add first purchase bonus
- Admin adjust gems
```

---

## 18. Sprint 12: Referral Module

Goal:

```txt
Build referral system.
```

Tasks:

```txt
- Generate referral code
- Register using referral code
- Track referral status
- Qualify referral after first delivered order
- Add referral reward
- Prevent self-referral
```

---

## 19. Sprint 13: Admin Dashboard

Goal:

```txt
Build admin management system.
```

Tasks:

```txt
- Dashboard summary
- Product management
- Order management
- Customization management
- Gift message management
- Coupon management
- Reward management
- Referral management
- Customer management
```

---

## 20. Development Rules

Important rules for Codex and developer:

```txt
- Work sprint by sprint.
- Do not build full project at once.
- Do not trust frontend price.
- Do not trust frontend order total.
- Validate backend input using Zod.
- Use Prisma for database access.
- Keep controllers thin.
- Put business logic in services.
- Protect admin routes.
- Use transactions during checkout.
- Verify payment from backend.
- Do not expose secrets in frontend.
```

---

## 21. Git Rules

Recommended branches:

```txt
main
development
feature/auth
feature/products
feature/cart
feature/orders
feature/payments
feature/admin-dashboard
```

Recommended commit examples:

```txt
feat: setup backend foundation
feat: add prisma database schema
feat: implement auth module
fix: prevent duplicate coupon usage
docs: add erd database design
```

---

## 22. Conclusion

This roadmap keeps The AMY Shop project professional, structured, and scalable.

The most important rule is:

```txt
Design everything professionally, but build in controlled phases.
```
