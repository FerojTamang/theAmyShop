# Backend Testing Guide

This is a manual QA guide for PowerShell. It uses placeholders only. Do not paste real secrets into documentation.

Start the API in another terminal:

```powershell
npm run server:dev
```

Set local variables:

```powershell
$API = "http://localhost:5000"
$CUSTOMER_TOKEN = "paste-customer-access-token"
$ADMIN_TOKEN = "paste-admin-access-token"
```

## Health

```powershell
Invoke-RestMethod -Method GET "$API/api/health"
```

Database connectivity:

```powershell
Invoke-RestMethod -Method GET "$API/api/health/db"
```

The basic health route remains available without a database query. If PostgreSQL is
paused or unreachable, the database health route returns `503` with a friendly
`database: "unavailable"` status.

## Auth

Register:

```powershell
$register = Invoke-RestMethod -Method POST "$API/api/auth/register" -ContentType "application/json" -Body (@{
  fullName = "QA Customer"
  email = "qa.customer@example.test"
  phone = "9800000001"
  password = "password123"
} | ConvertTo-Json)
$CUSTOMER_TOKEN = $register.data.tokens.accessToken
```

Login:

```powershell
$login = Invoke-RestMethod -Method POST "$API/api/auth/login" -ContentType "application/json" -Body (@{
  identifier = "9800000001"
  password = "password123"
} | ConvertTo-Json)
$CUSTOMER_TOKEN = $login.data.tokens.accessToken
```

Current user:

```powershell
Invoke-RestMethod -Method GET "$API/api/auth/me" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }
```

## Account

```powershell
Invoke-RestMethod -Method GET "$API/api/account/profile" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }

Invoke-RestMethod -Method PATCH "$API/api/account/profile" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  fullName = "QA Customer Updated"
  profileImage = "https://example.test/profile.jpg"
} | ConvertTo-Json)

Invoke-RestMethod -Method PATCH "$API/api/account/change-password" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  currentPassword = "password123"
  newPassword = "password456"
  confirmPassword = "password456"
} | ConvertTo-Json)
```

Auth rate-limit check: send the same login or registration request more than five
times within 15 minutes from one IP. The next request returns `429` with a friendly
message. Refresh-token requests have a separate limit of 30 per 15 minutes.

## Categories

```powershell
Invoke-RestMethod -Method GET "$API/api/categories"

$category = Invoke-RestMethod -Method POST "$API/api/admin/categories" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  name = "QA Gifts"
  slug = "qa-gifts"
  description = "QA category"
  isActive = $true
} | ConvertTo-Json)
$CATEGORY_ID = $category.data.category.id

Invoke-RestMethod -Method PATCH "$API/api/admin/categories/$CATEGORY_ID" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  description = "Updated QA category"
} | ConvertTo-Json)
```

## Products

```powershell
$product = Invoke-RestMethod -Method POST "$API/api/admin/products" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  categoryId = $CATEGORY_ID
  name = "QA Mug"
  slug = "qa-mug"
  description = "QA product"
  price = 1000
  stock = 5
  stockType = "READY_STOCK"
  isCustomizable = $true
  isGiftSupported = $true
} | ConvertTo-Json -Depth 5)
$PRODUCT_ID = $product.data.product.id

Invoke-RestMethod -Method GET "$API/api/products?search=QA"
Invoke-RestMethod -Method GET "$API/api/products/qa-mug"
```

## Addresses

```powershell
$address = Invoke-RestMethod -Method POST "$API/api/addresses" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  fullName = "QA Customer"
  phone = "9800000001"
  province = "Bagmati"
  district = "Kathmandu"
  city = "Kathmandu"
  streetAddress = "QA Street"
  landmark = "QA Landmark"
  isDefault = $true
} | ConvertTo-Json)
$ADDRESS_ID = $address.data.address.id

Invoke-RestMethod -Method GET "$API/api/addresses/my" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }
```

## Cart

```powershell
Invoke-RestMethod -Method GET "$API/api/cart" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }

Invoke-RestMethod -Method POST "$API/api/cart/items" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  productId = $PRODUCT_ID
  quantity = 1
} | ConvertTo-Json)
```

## Checkout and Orders

```powershell
$order = Invoke-RestMethod -Method POST "$API/api/checkout" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  addressId = $ADDRESS_ID
  paymentMethod = "CASH_ON_DELIVERY"
  gift = @{
    receiverName = "QA Receiver"
    senderName = "QA Sender"
    giftMessage = "QA gift message"
    giftWrapRequired = $true
  }
} | ConvertTo-Json -Depth 5)
$ORDER_ID = $order.data.order.id

Invoke-RestMethod -Method GET "$API/api/orders/my" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/orders" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }

Invoke-RestMethod -Method PATCH "$API/api/admin/orders/$ORDER_ID/status" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  orderStatus = "CONFIRMED"
  note = "QA confirmed"
} | ConvertTo-Json)

# Invalid backward transition: CONFIRMED to PENDING returns 400.
Invoke-RestMethod -Method PATCH "$API/api/admin/orders/$ORDER_ID/status" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  orderStatus = "PENDING"
  note = "QA invalid transition"
} | ConvertTo-Json)
```

Checkout fees are server-owned: standard shipping is `0`, and gift wrapping is
`50` when `giftWrapRequired` is true. To verify legacy-field tampering is ignored,
refill the cart and send obsolete fee fields manually:

```powershell
$tamperedOrder = Invoke-RestMethod -Method POST "$API/api/checkout" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  addressId = $ADDRESS_ID
  paymentMethod = "CASH_ON_DELIVERY"
  shippingFee = 999
  gift = @{
    receiverName = "QA Receiver"
    senderName = "QA Sender"
    giftMessage = "QA gift message"
    giftWrapRequired = $true
    giftWrapFee = 0
  }
} | ConvertTo-Json -Depth 5)

$tamperedOrder.data.order | Select-Object shippingFee, giftWrapFee, totalAmount
```

The persisted response must show `shippingFee = 0` and `giftWrapFee = 50`.
Coupon validation is an informational, non-reserving preview only. Checkout remains
the source of truth: it recalculates discounts from database product prices and
server-owned fees, revalidates availability, and atomically reserves coupon usage
against the global limit inside the order transaction. It then rechecks the customer's
per-user usage while holding the coupon row lock. Manipulated preview totals and
legacy checkout fee fields must never control the persisted discount or final total.

## Payments

Cash on Delivery is the only active storefront checkout method. Khalti and eSewa
routes remain backend integration placeholders and must not be presented as usable
production payment options.

```powershell
Invoke-RestMethod -Method GET "$API/api/payments/my" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }

$payments = Invoke-RestMethod -Method GET "$API/api/admin/payments" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
$PAYMENT_ID = $payments.data.payments[0].id

Invoke-RestMethod -Method PATCH "$API/api/admin/payments/$PAYMENT_ID/status" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  status = "PAID"
  rawResponse = @{
    source = "manual-qa"
  }
} | ConvertTo-Json -Depth 5)
```

The following is a negative placeholder test only: Khalti/eSewa verification
requires credentials and live verification remains pending, so it must not be used
as a successful payment-flow test.

```powershell
Invoke-RestMethod -Method POST "$API/api/payments/khalti/verify" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  orderId = $ORDER_ID
  transactionId = "fake-transaction-id"
} | ConvertTo-Json)
```

## Coupons

```powershell
$coupon = Invoke-RestMethod -Method POST "$API/api/admin/coupons" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  code = "QA10"
  title = "QA Discount"
  discountType = "PERCENTAGE_DISCOUNT"
  discountValue = 10
  minimumOrderAmount = 100
  usageLimit = 1
  perUserLimit = 1
  startsAt = "2026-01-01T00:00:00.000Z"
  expiresAt = "2026-12-31T23:59:59.000Z"
  isActive = $true
} | ConvertTo-Json)

Invoke-RestMethod -Method POST "$API/api/coupons/validate" -ContentType "application/json" -Body (@{
  code = "QA10"
  orderAmount = 1000
  shippingFee = 100
  giftWrapFee = 50
} | ConvertTo-Json)
```

The validation request above does not consume or reserve the coupon. As a
source-of-truth check, repeat validation with deliberately inflated `orderAmount`,
`shippingFee`, or `giftWrapFee` values, then submit checkout using only the coupon
code and normal checkout fields. The created order's discount and total must be
based on the database cart prices and server-owned fees. If an older client also
sends legacy checkout fee fields, those fields must still be ignored.

Coupon concurrency checks require non-empty carts, valid addresses, and enough
product stock so stock exhaustion does not hide the coupon result:

1. For the global limit, create a fresh coupon with `usageLimit = 1`, prepare two
   different customer accounts, and send both checkout requests with that coupon as
   close together as possible from separate terminals or API clients.
2. Exactly one request should succeed. The competing request should return HTTP
   `400` with `Coupon is no longer available.` The coupon's persisted `usedCount`
   and redemption count must remain `1`.
3. For the per-user limit, create a separate coupon with a comfortably higher
   global limit and `perUserLimit = 1`. Prepare one customer's cart, then issue two
   simultaneous checkout requests for that customer and coupon.
4. At most one request should create an order and redemption. The other should
   return the same friendly HTTP `400` response, and that customer's redemption
   count must not exceed `1`.
5. If the second same-user request starts only after the first has committed, it can
   return `Cart is empty` instead; that means the requests did not overlap at the
   coupon reservation point. Use a coordinated start or rerun the test.
6. For each rejected request, verify there is no partial order or redemption and no
   extra coupon usage increment or stock decrement. In the two-user global-limit
   case, the rejected customer's cart must remain intact. In the same-user case,
   the successful checkout legitimately clears the shared cart, so use persisted
   order/redemption/usage/stock counts to verify that the rejected transaction added
   no side effects. Use the admin endpoints and database inspection where needed.

Because simultaneous timing varies by machine and database connection pool, repeat
each concurrency case several times with a newly created coupon. Checkout, rather
than a preceding successful preview, is always authoritative.

## Customizations and Uploads

The backend can store standalone customization requests. The storefront does not
yet persist product-page customization selections or attach them to cart/order
flows, so customization requests in this section are API-only manual QA.

Cloudinary must be configured for upload routes.

Upload validation checks:

```powershell
# An image larger than 5MB returns 413.
Invoke-RestMethod -Method POST "$API/api/admin/uploads/product-image" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -Form @{
  image = Get-Item "path-to-image-over-5mb.jpg"
}

# A non-JPG/PNG/WEBP file returns 400.
Invoke-RestMethod -Method POST "$API/api/admin/uploads/product-image" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -Form @{
  image = Get-Item "path-to-invalid-file.gif"
}
```

```powershell
Invoke-RestMethod -Method POST "$API/api/customizations" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  productId = $PRODUCT_ID
  customText = "QA text"
  colorPreference = "Pink"
  designNote = "QA design"
} | ConvertTo-Json)

Invoke-RestMethod -Method GET "$API/api/admin/customizations" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
```

## Gift Options

```powershell
Invoke-RestMethod -Method GET "$API/api/admin/gift-options" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
```

## Reviews

Review creation requires a delivered order containing the product.

```powershell
$deliveryStatuses = @(
  "CONFIRMED",
  "PROCESSING",
  "IN_PRODUCTION",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED"
)

foreach ($status in $deliveryStatuses) {
  Invoke-RestMethod -Method PATCH "$API/api/admin/orders/$ORDER_ID/status" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
    orderStatus = $status
    note = "QA moved order to $status"
  } | ConvertTo-Json)
}

$review = Invoke-RestMethod -Method POST "$API/api/reviews" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  productId = $PRODUCT_ID
  orderId = $ORDER_ID
  rating = 5
  comment = "Great QA product"
} | ConvertTo-Json)
$REVIEW_ID = $review.data.review.id

Invoke-RestMethod -Method PATCH "$API/api/admin/reviews/$REVIEW_ID/status" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  status = "APPROVED"
} | ConvertTo-Json)
```

## Rewards

```powershell
Invoke-RestMethod -Method GET "$API/api/rewards/wallet" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }

Invoke-RestMethod -Method POST "$API/api/admin/rewards/adjust" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  userId = "customer-user-id"
  gems = 25
  description = "QA adjustment"
} | ConvertTo-Json)
```

## Referrals

```powershell
$code = Invoke-RestMethod -Method GET "$API/api/referrals/code" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }
$REFERRAL_CODE = $code.data.referralCode.code

Invoke-RestMethod -Method GET "$API/api/referrals/my" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/referrals" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
```

## Customers

```powershell
$customers = Invoke-RestMethod -Method GET "$API/api/admin/customers?page=1&limit=20" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
$CUSTOMER_ID = $customers.data.customers[0].id

Invoke-RestMethod -Method GET "$API/api/admin/customers/$CUSTOMER_ID" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }

Invoke-RestMethod -Method PATCH "$API/api/admin/customers/$CUSTOMER_ID/status" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -ContentType "application/json" -Body (@{
  status = "ACTIVE"
} | ConvertTo-Json)
```

## Dashboard

```powershell
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/summary" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/recent-orders?limit=10" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/low-stock-products?lowStockThreshold=5" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/sales-overview" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/order-status-summary" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/payment-status-summary" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/review-summary" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
```

## Negative QA Checks

Unauthorized access should fail:

```powershell
Invoke-RestMethod -Method GET "$API/api/account/profile"
```

Customer access to admin route should fail:

```powershell
Invoke-RestMethod -Method GET "$API/api/admin/dashboard/summary" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" }
```

Invalid validation should fail:

```powershell
Invoke-RestMethod -Method POST "$API/api/cart/items" -Headers @{ Authorization = "Bearer $CUSTOMER_TOKEN" } -ContentType "application/json" -Body (@{
  productId = ""
  quantity = 0
} | ConvertTo-Json)
```
