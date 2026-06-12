# The AMY Shop - Codex Instructions

This is a professional PERN stack e-commerce platform for a handmade custom gift shop.

Tech stack:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Payment: Khalti, eSewa, Cash on Delivery
- Image storage: Cloudinary

Important business features:
- Phone/email registration
- Product customization
- Gift message printing
- Cart and checkout
- Coupon system
- Gems/rewards
- First purchase bonus
- Referral system
- Admin dashboard
- Payment verification from backend only

Rules:
- Work sprint by sprint.
- Do not build the full project at once.
- Do not create unrelated features.
- Do not trust product price from frontend.
- Do not trust order total from frontend.
- Validate all backend input using Zod.
- Use Prisma for database access.
- Use TypeScript strictly.
- Keep controllers thin.
- Put business logic inside services.
- Protect admin routes with role middleware.
- Use database transactions during checkout/order creation.
- Payment must be verified on backend.
- Do not expose secrets in frontend.
- Follow the docs folder.

Before editing code:
1. Read the related docs.
2. Explain the plan.
3. Wait for approval.
4. Make only the approved changes.