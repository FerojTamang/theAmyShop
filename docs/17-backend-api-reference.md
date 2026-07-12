# Backend API Reference

Base URL: `http://localhost:5000`

All JSON responses use:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message",
  "data": {}
}
```

Authenticated requests use:

```http
Authorization: Bearer <accessToken>
```

Do not place real tokens, secrets, database URLs, or payment credentials in documentation or shared request collections.

## Common Errors

| Status | Meaning |
| --- | --- |
| 400 | Validation failed or business rule failed |
| 401 | Missing, invalid, or expired token |
| 403 | Account inactive or role not allowed |
| 404 | Resource not found |
| 409 | Duplicate or conflict |
| 413 | Uploaded image exceeds the maximum size |
| 429 | Too many requests |
| 501 | Feature placeholder not implemented |
| 503 | External service credentials not configured |
| 503 | Database service temporarily unavailable |

## Health

### GET `/api/health`

Checks API process health without querying the database.

### GET `/api/health/db`

Checks database connectivity. A successful response includes `database: "available"`.
If PostgreSQL is unreachable, it returns `503` with `database: "unavailable"` and
`message: "Database connection failed"` in the response data. Technical connection
details are logged only on the server.

## Auth

### POST `/api/auth/register`

Auth: public

Body:

```json
{
  "fullName": "Asha Customer",
  "email": "asha@example.test",
  "phone": "9800000001",
  "password": "password123",
  "referralCode": "AMYEXAMPLE"
}
```

Notes: `email` and `referralCode` are optional. Creates customer, reward wallet, referral code, and optional referral record. Returns safe user and tokens.

### POST `/api/auth/login`

Auth: public

Body:

```json
{
  "identifier": "9800000001",
  "password": "password123"
}
```

Notes: `identifier` can be phone or email. Inactive/suspended accounts cannot login.
Login and registration are limited to 5 requests per IP per 15 minutes. The
refresh-token endpoint is limited to 30 requests per IP per 15 minutes. Exceeding
a limit returns `429` with `Too many attempts. Please try again later.`

### GET `/api/auth/me`

Auth: any active user

Returns the current safe user.

### POST `/api/auth/refresh-token`

Auth: public

Body:

```json
{
  "refreshToken": "paste-refresh-token"
}
```

Returns new auth tokens.

The frontend attempts this refresh once when an eligible authenticated request
returns `401`, stores both replacement tokens, and retries the original request
once. Concurrent `401` responses share one refresh request. Login, registration,
refresh, and logout requests are excluded from automatic retry. If refresh fails,
the frontend clears its session and protected routes return the user to login.
Refresh-token revocation and persistent session storage are outside the current
sprint; logout remains stateless.

### POST `/api/auth/logout`

Auth: any active user

Notes: stateless logout response; no token revocation store exists yet.

## Account

### GET `/api/account/profile`

Auth: any active user

Returns safe account fields and `CustomerProfile` if present.

### PATCH `/api/account/profile`

Auth: any active user

Body:

```json
{
  "fullName": "Updated Name",
  "phone": "9800000002",
  "profileImage": "https://example.test/profile.jpg"
}
```

Notes: only `fullName`, `phone`, and `profileImage` are allowed. Phone changes reset `phoneVerified` to `false`.

### PATCH `/api/account/change-password`

Auth: any active user

Body:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password-123",
  "confirmPassword": "new-password-123"
}
```

Notes: verifies current password and stores only the new hash.

## Addresses

Customer-owned routes require auth.

Create/update body fields:

```json
{
  "fullName": "Asha Customer",
  "phone": "9800000001",
  "province": "Bagmati",
  "district": "Kathmandu",
  "city": "Kathmandu",
  "streetAddress": "Example Street",
  "landmark": "Near example",
  "isDefault": true
}
```

Routes:

- `POST /api/addresses`
- `GET /api/addresses/my`
- `GET /api/addresses/:id`
- `PATCH /api/addresses/:id`
- `DELETE /api/addresses/:id`

Notes: deleting an address used by an order is blocked.

## Categories

Public:

- `GET /api/categories`
- `GET /api/categories/:slug`

Admin:

- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

Create body:

```json
{
  "name": "Custom Gifts",
  "slug": "custom-gifts",
  "description": "Handmade custom gifts",
  "isActive": true
}
```

Notes: delete deactivates the category.

## Products

Public:

- `GET /api/products?search=gift&categorySlug=custom-gifts&stockType=READY_STOCK&page=1&limit=20`
- `GET /api/products/:slug`

Admin:

- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

Create body:

```json
{
  "categoryId": "category-id",
  "name": "Personalized Mug",
  "slug": "personalized-mug",
  "description": "Handmade mug",
  "price": 1200,
  "stock": 10,
  "stockType": "READY_STOCK",
  "isCustomizable": true,
  "isGiftSupported": true,
  "images": [
    {
      "imageUrl": "https://example.test/image.jpg",
      "publicId": "fake-public-id",
      "isPrimary": true
    },
    {
      "imageUrl": "https://example.test/image-detail.jpg",
      "publicId": "fake-detail-public-id",
      "isPrimary": false
    }
  ]
}
```

Notes: product create and update accept multiple images. At most one image may have
`isPrimary: true`. Delete deactivates the product.

## Cart

Auth: any active user

Routes:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

Add item body:

```json
{
  "productId": "product-id",
  "quantity": 1
}
```

Notes: product availability and ready-stock quantities are checked on backend.

## Checkout

### POST `/api/checkout`

Auth: any active user

Body:

```json
{
  "addressId": "address-id",
  "paymentMethod": "CASH_ON_DELIVERY",
  "couponCode": "WELCOME10",
  "gift": {
    "receiverName": "Receiver",
    "senderName": "Sender",
    "giftMessage": "Happy birthday",
    "giftWrapRequired": true
  }
}
```

Notes: only COD checkout is currently accepted. Product prices, coupon discounts,
gift fees, shipping, and totals are calculated on the backend. The current
server-owned standard shipping fee is `0`. When `giftWrapRequired` is `true`, the
server applies a gift-wrap fee of `50`; otherwise it applies `0`. Client-supplied
`shippingFee` and `giftWrapFee` fields are ignored. Checkout runs inside a database
transaction.

## Coupons

Public:

- `POST /api/coupons/validate`

Validate body:

```json
{
  "code": "WELCOME10",
  "orderAmount": 1500,
  "shippingFee": 100,
  "giftWrapFee": 50
}
```

Admin:

- `POST /api/admin/coupons`
- `GET /api/admin/coupons?search=welcome&discountType=PERCENTAGE_DISCOUNT&isActive=true&page=1&limit=20`
- `GET /api/admin/coupons/:id`
- `PATCH /api/admin/coupons/:id`
- `DELETE /api/admin/coupons/:id`

Create body:

```json
{
  "code": "WELCOME10",
  "title": "Welcome discount",
  "discountType": "PERCENTAGE_DISCOUNT",
  "discountValue": 10,
  "minimumOrderAmount": 1000,
  "maximumDiscountAmount": 500,
  "usageLimit": 100,
  "perUserLimit": 1,
  "startsAt": "2026-01-01T00:00:00.000Z",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "isActive": true
}
```

Notes: delete deactivates the coupon.

## Customizations

Customer:

- `POST /api/customizations`
- `GET /api/customizations/my`
- `GET /api/customizations/:id`

Create body:

```json
{
  "productId": "product-id",
  "customText": "Name: Asha",
  "colorPreference": "Pink",
  "sizePreference": "Medium",
  "designNote": "Simple floral style",
  "neededByDate": "2026-12-31T00:00:00.000Z",
  "referenceImages": [
    {
      "imageUrl": "https://example.test/reference.jpg",
      "publicId": "fake-public-id"
    }
  ]
}
```

Admin:

- `GET /api/admin/customizations?status=PENDING_REVIEW&productId=product-id&userId=user-id&page=1&limit=20`
- `GET /api/admin/customizations/:id`
- `PATCH /api/admin/customizations/:id/status`

Status body:

```json
{
  "status": "APPROVED",
  "adminNote": "Approved for production"
}
```

## Gift Options

Admin only:

- `GET /api/admin/gift-options?printStatus=PENDING&page=1&limit=20`
- `GET /api/admin/gift-options/:id`
- `PATCH /api/admin/gift-options/:id/print-status`

Body:

```json
{
  "printStatus": "PRINTED"
}
```

## Orders

Customer:

- `GET /api/orders/my?orderStatus=PENDING&paymentStatus=PENDING&paymentMethod=CASH_ON_DELIVERY&page=1&limit=20`
- `GET /api/orders/:id`

Admin:

- `GET /api/admin/orders?search=AMY&orderStatus=PENDING&paymentStatus=PENDING&page=1&limit=20`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`

Status body:

```json
{
  "orderStatus": "CONFIRMED",
  "note": "Confirmed by admin"
}
```

Notes: admin status changes create order status history. Sending the current status
again is idempotent and does not create another history entry.

Allowed transitions:

| Current status | Allowed next statuses |
| --- | --- |
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `PROCESSING`, `CANCELLED` |
| `PROCESSING` | `IN_PRODUCTION`, `CANCELLED` |
| `IN_PRODUCTION` | `READY_TO_SHIP`, `CANCELLED` |
| `READY_TO_SHIP` | `SHIPPED` |
| `SHIPPED` | `DELIVERED` |
| `DELIVERED` | `RETURNED` |
| `CANCELLED` | None (terminal) |
| `RETURNED` | None (terminal) |

Invalid transitions return HTTP `400` with:
`Invalid order status transition from CURRENT_STATUS to NEXT_STATUS.`

## Payments

Customer:

- `GET /api/payments/my?provider=CASH_ON_DELIVERY&status=PENDING&page=1&limit=20`
- `GET /api/payments/:id`
- `POST /api/payments/khalti/initiate`
- `POST /api/payments/khalti/verify`
- `POST /api/payments/esewa/initiate`
- `POST /api/payments/esewa/verify`

Initiate body:

```json
{
  "orderId": "order-id"
}
```

Verify body:

```json
{
  "orderId": "order-id",
  "transactionId": "fake-transaction-id",
  "rawResponse": {
    "example": true
  }
}
```

Admin:

- `GET /api/admin/payments?provider=CASH_ON_DELIVERY&status=PENDING&search=AMY&page=1&limit=20`
- `GET /api/admin/payments/:id`
- `PATCH /api/admin/payments/:id/status`

Status body:

```json
{
  "status": "PAID",
  "rawResponse": {
    "source": "manual-admin-update"
  }
}
```

Notes: Khalti/eSewa live verification is pending and currently returns `501` after credential checks. Admin status updates also sync the related order `paymentStatus`.

## Reviews

Public:

- `GET /api/products/:productId/reviews?page=1&limit=20`

Customer:

- `POST /api/reviews`
- `GET /api/reviews/my?status=PENDING&page=1&limit=20`
- `GET /api/reviews/:id`
- `PATCH /api/reviews/:id`
- `DELETE /api/reviews/:id`

Create body:

```json
{
  "productId": "product-id",
  "orderId": "delivered-order-id",
  "rating": 5,
  "comment": "Beautiful work"
}
```

Admin:

- `GET /api/admin/reviews?status=PENDING&productId=product-id&userId=user-id&page=1&limit=20`
- `GET /api/admin/reviews/:id`
- `PATCH /api/admin/reviews/:id/status`

Status body:

```json
{
  "status": "APPROVED"
}
```

Notes: customer review creation requires a delivered order containing the product.

## Rewards

Customer:

- `GET /api/rewards/wallet`
- `GET /api/rewards/transactions?type=ADMIN_ADJUSTMENT&page=1&limit=20`

Admin:

- `GET /api/admin/rewards/wallets?search=asha&page=1&limit=20`
- `GET /api/admin/rewards/wallets/:userId`
- `GET /api/admin/rewards/transactions?userId=user-id&type=ADMIN_ADJUSTMENT&page=1&limit=20`
- `POST /api/admin/rewards/adjust`

Adjust body:

```json
{
  "userId": "user-id",
  "gems": 25,
  "description": "Manual adjustment"
}
```

Notes: negative adjustments cannot make wallet balance negative.

## Referrals

Customer:

- `GET /api/referrals/code`
- `POST /api/referrals/apply`
- `GET /api/referrals/my?status=REGISTERED&page=1&limit=20`

Apply body:

```json
{
  "code": "AMYEXAMPLE"
}
```

Admin:

- `GET /api/admin/referrals?status=REGISTERED&referrerUserId=user-id&referredUserId=user-id&page=1&limit=20`
- `PATCH /api/admin/referrals/:id/status`

Status body:

```json
{
  "status": "QUALIFIED"
}
```

Notes: self-referral and duplicate referral application are blocked. Automatic referral rewards are pending.

## Customers

Admin only:

- `GET /api/admin/customers?search=asha&status=ACTIVE&page=1&limit=20`
- `GET /api/admin/customers/:id`
- `PATCH /api/admin/customers/:id/status`

Status body:

```json
{
  "status": "SUSPENDED"
}
```

Notes: admin cannot change customer passwords in the current API.

## Dashboard

Admin only:

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/recent-orders?limit=10&from=2026-01-01&to=2026-12-31`
- `GET /api/admin/dashboard/low-stock-products?lowStockThreshold=5&limit=20`
- `GET /api/admin/dashboard/sales-overview?from=2026-01-01&to=2026-01-07`
- `GET /api/admin/dashboard/order-status-summary?from=2026-01-01&to=2026-12-31`
- `GET /api/admin/dashboard/payment-status-summary?from=2026-01-01&to=2026-12-31`
- `GET /api/admin/dashboard/review-summary?from=2026-01-01&to=2026-12-31`

Notes: revenue uses `Order.totalAmount` only where `paymentStatus = PAID`.

## Uploads

Customer:

- `POST /api/uploads/customization-reference`

Admin:

- `POST /api/admin/uploads/product-image`

Body type: `multipart/form-data`

Field:

- `image`: image file

Notes: the endpoint uploads one image per request and can be called repeatedly to
build a product gallery. Cloudinary credentials must be configured. Otherwise upload
routes return `503`. Images larger than 5MB return `413`. Unsupported image types
return `400`; accepted types are JPG, PNG, and WEBP.
