# API Route Inventory

Base URL for local development: `http://localhost:5000`

Auth headers use `Authorization: Bearer <accessToken>`.

## Health

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | No | Public | Check API health |
| GET | `/api/health/db` | No | Public | Check database connectivity |

## Auth

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Public | Register customer |
| POST | `/api/auth/login` | No | Public | Login customer/admin |
| GET | `/api/auth/me` | Yes | Any active user | Get current user |
| POST | `/api/auth/refresh-token` | No | Public | Refresh auth tokens |
| POST | `/api/auth/logout` | Yes | Any active user | Stateless logout response |

## Account

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/account/profile` | Yes | Any active user | Get own profile |
| PATCH | `/api/account/profile` | Yes | Any active user | Update safe account fields |
| PATCH | `/api/account/change-password` | Yes | Any active user | Change own password |

## Store Settings

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/store-settings` | No | Public | Get safe storefront display settings |
| GET | `/api/admin/store-settings` | Yes | ADMIN, SUPER_ADMIN | Get store settings |
| PATCH | `/api/admin/store-settings` | Yes | ADMIN, SUPER_ADMIN | Update store settings |

## Addresses

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/addresses` | Yes | Any active user | Create address |
| GET | `/api/addresses/my` | Yes | Any active user | List own addresses |
| GET | `/api/addresses/:id` | Yes | Any active user | Get owned address |
| PATCH | `/api/addresses/:id` | Yes | Any active user | Update owned address |
| DELETE | `/api/addresses/:id` | Yes | Any active user | Delete owned unused address |

## Categories

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/categories` | No | Public | List active categories |
| GET | `/api/categories/:slug` | No | Public | Get active category with products |
| POST | `/api/admin/categories` | Yes | ADMIN, SUPER_ADMIN | Create category |
| PATCH | `/api/admin/categories/:id` | Yes | ADMIN, SUPER_ADMIN | Update category |
| DELETE | `/api/admin/categories/:id` | Yes | ADMIN, SUPER_ADMIN | Deactivate category |

## Products

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/products` | No | Public | List active products |
| GET | `/api/products/:slug` | No | Public | Get active product |
| POST | `/api/admin/products` | Yes | ADMIN, SUPER_ADMIN | Create product |
| PATCH | `/api/admin/products/:id` | Yes | ADMIN, SUPER_ADMIN | Update product |
| DELETE | `/api/admin/products/:id` | Yes | ADMIN, SUPER_ADMIN | Deactivate product |

## Cart

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/cart` | Yes | Any active user | Get own cart |
| POST | `/api/cart/items` | Yes | Any active user | Add product to cart |
| PATCH | `/api/cart/items/:id` | Yes | Any active user | Update cart item quantity |
| DELETE | `/api/cart/items/:id` | Yes | Any active user | Remove cart item |
| DELETE | `/api/cart` | Yes | Any active user | Clear cart |

## Checkout

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/checkout` | Yes | Any active user | Create order from cart |

## Coupons

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/coupons/validate` | No | Public | Preview coupon validation |
| POST | `/api/admin/coupons` | Yes | ADMIN, SUPER_ADMIN | Create coupon |
| GET | `/api/admin/coupons` | Yes | ADMIN, SUPER_ADMIN | List coupons |
| GET | `/api/admin/coupons/:id` | Yes | ADMIN, SUPER_ADMIN | Get coupon |
| PATCH | `/api/admin/coupons/:id` | Yes | ADMIN, SUPER_ADMIN | Update coupon |
| DELETE | `/api/admin/coupons/:id` | Yes | ADMIN, SUPER_ADMIN | Deactivate coupon |

## Customizations

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/customizations` | Yes | Any active user | Create customization request |
| GET | `/api/customizations/my` | Yes | Any active user | List own customization requests |
| GET | `/api/customizations/:id` | Yes | Any active user | Get owned customization request |
| GET | `/api/admin/customizations` | Yes | ADMIN, SUPER_ADMIN | List customization requests |
| GET | `/api/admin/customizations/:id` | Yes | ADMIN, SUPER_ADMIN | Get customization request |
| PATCH | `/api/admin/customizations/:id/status` | Yes | ADMIN, SUPER_ADMIN | Update customization status |

## Gift Options

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/gift-options` | Yes | ADMIN, SUPER_ADMIN | List gift options |
| GET | `/api/admin/gift-options/:id` | Yes | ADMIN, SUPER_ADMIN | Get gift option |
| PATCH | `/api/admin/gift-options/:id/print-status` | Yes | ADMIN, SUPER_ADMIN | Update gift print status |

## Orders

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/orders/my` | Yes | Any active user | List own orders |
| GET | `/api/orders/:id` | Yes | Any active user | Get owned order |
| GET | `/api/admin/orders` | Yes | ADMIN, SUPER_ADMIN | List all orders |
| GET | `/api/admin/orders/:id` | Yes | ADMIN, SUPER_ADMIN | Get order |
| PATCH | `/api/admin/orders/:id/status` | Yes | ADMIN, SUPER_ADMIN | Update order status |

## Payments

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/payments/my` | Yes | Any active user | List own payments |
| GET | `/api/payments/:id` | Yes | Any active user | Get owned payment |
| POST | `/api/payments/khalti/initiate` | Yes | Any active user | Khalti integration placeholder; not active in storefront |
| POST | `/api/payments/khalti/verify` | Yes | Any active user | Khalti verification placeholder; not production-ready |
| POST | `/api/payments/esewa/initiate` | Yes | Any active user | eSewa integration placeholder; not active in storefront |
| POST | `/api/payments/esewa/verify` | Yes | Any active user | eSewa verification placeholder; not production-ready |
| GET | `/api/admin/payments` | Yes | ADMIN, SUPER_ADMIN | List payments |
| GET | `/api/admin/payments/:id` | Yes | ADMIN, SUPER_ADMIN | Get payment |
| PATCH | `/api/admin/payments/:id/status` | Yes | ADMIN, SUPER_ADMIN | Update payment status |

## Reviews

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/products/:productId/reviews` | No | Public | List approved product reviews |
| POST | `/api/reviews` | Yes | Any active user | Create review for delivered purchase |
| GET | `/api/reviews/my` | Yes | Any active user | List own reviews |
| GET | `/api/reviews/:id` | Yes | Any active user | Get owned review |
| PATCH | `/api/reviews/:id` | Yes | Any active user | Update owned review |
| DELETE | `/api/reviews/:id` | Yes | Any active user | Soft-delete owned review |
| GET | `/api/admin/reviews` | Yes | ADMIN, SUPER_ADMIN | List reviews |
| GET | `/api/admin/reviews/:id` | Yes | ADMIN, SUPER_ADMIN | Get review |
| PATCH | `/api/admin/reviews/:id/status` | Yes | ADMIN, SUPER_ADMIN | Update review status |

## Rewards

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/rewards/wallet` | Yes | Any active user | Get own reward wallet |
| GET | `/api/rewards/transactions` | Yes | Any active user | List own reward transactions |
| GET | `/api/admin/rewards/wallets` | Yes | ADMIN, SUPER_ADMIN | List reward wallets |
| GET | `/api/admin/rewards/wallets/:userId` | Yes | ADMIN, SUPER_ADMIN | Get wallet by user |
| GET | `/api/admin/rewards/transactions` | Yes | ADMIN, SUPER_ADMIN | List reward transactions |
| POST | `/api/admin/rewards/adjust` | Yes | ADMIN, SUPER_ADMIN | Admin adjust gems |

## Referrals

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/referrals/code` | Yes | Any active user | Get or create own referral code |
| POST | `/api/referrals/apply` | Yes | Any active user | Apply another user's referral code |
| GET | `/api/referrals/my` | Yes | Any active user | List own referral history |
| GET | `/api/admin/referrals` | Yes | ADMIN, SUPER_ADMIN | List referrals |
| PATCH | `/api/admin/referrals/:id/status` | Yes | ADMIN, SUPER_ADMIN | Update referral status |

## Customers

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/customers` | Yes | ADMIN, SUPER_ADMIN | List customers |
| GET | `/api/admin/customers/:id` | Yes | ADMIN, SUPER_ADMIN | Get customer summary |
| PATCH | `/api/admin/customers/:id/status` | Yes | ADMIN, SUPER_ADMIN | Update customer account status |

## Dashboard

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/admin/dashboard/summary` | Yes | ADMIN, SUPER_ADMIN | Dashboard totals |
| GET | `/api/admin/dashboard/recent-orders` | Yes | ADMIN, SUPER_ADMIN | Recent orders |
| GET | `/api/admin/dashboard/low-stock-products` | Yes | ADMIN, SUPER_ADMIN | Low stock products |
| GET | `/api/admin/dashboard/sales-overview` | Yes | ADMIN, SUPER_ADMIN | Daily paid sales overview |
| GET | `/api/admin/dashboard/order-status-summary` | Yes | ADMIN, SUPER_ADMIN | Order status counts |
| GET | `/api/admin/dashboard/payment-status-summary` | Yes | ADMIN, SUPER_ADMIN | Payment status counts |
| GET | `/api/admin/dashboard/review-summary` | Yes | ADMIN, SUPER_ADMIN | Review counts and rating summary |

## Uploads

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/uploads/customization-reference` | Yes | Any active user | Upload customization reference image |
| POST | `/api/admin/uploads/product-image` | Yes | ADMIN, SUPER_ADMIN | Upload product image |
