# ERD and Database Design

# The AMY Shop — Handmade Custom Gift E-Commerce Platform

## 1. Purpose

This document defines the database structure for The AMY Shop, a PERN stack handmade custom gift e-commerce platform.

The database will use PostgreSQL with Prisma ORM.

The system must support:

* Customer accounts
* Product management
* Handmade product customization
* Gift message printing
* Cart and checkout
* Orders
* Payments
* Coupons
* Gems/rewards
* Referral system
* Reviews
* Admin dashboard

---

## 2. Main Database Modules

The database will be divided into these modules:

1. User Module
2. Product Module
3. Cart Module
4. Order Module
5. Payment Module
6. Gift Message Module
7. Customization Module
8. Coupon Module
9. Reward/Gems Module
10. Referral Module
11. Review Module
12. Order Status History Module

---

## 3. Required Prisma Models

Sprint 2 should create these Prisma models:

```txt
User
CustomerProfile
Address
Category
Product
ProductImage
Cart
CartItem
Order
OrderItem
Payment
GiftOption
CustomizationRequest
CustomizationReferenceImage
Coupon
CouponRedemption
RewardWallet
RewardTransaction
ReferralCode
Referral
Review
OrderStatusHistory
```

---

## 4. Required Enums

Sprint 2 should create these Prisma enums:

```txt
UserRole
AccountStatus
StockType
PaymentMethod
PaymentStatus
OrderStatus
GiftPrintStatus
CustomizationStatus
CouponType
RewardTransactionType
ReferralStatus
ReviewStatus
```

---

## 5. Model Details

## 5.1 User

The `User` model stores all customers, admins, and super admins.

Required fields:

```txt
id
fullName
email
phone
passwordHash
role
status
emailVerified
phoneVerified
createdAt
updatedAt
```

Rules:

* Phone should be unique.
* Email should be unique but optional.
* Password must be stored as hash only.
* Role should support CUSTOMER, ADMIN, SUPER_ADMIN.

---

## 5.2 CustomerProfile

Stores extra customer information.

Required fields:

```txt
id
userId
profileImage
totalOrders
totalSpent
createdAt
updatedAt
```

Relationship:

```txt
One User has one CustomerProfile
```

---

## 5.3 Address

Stores customer delivery addresses.

Required fields:

```txt
id
userId
fullName
phone
province
district
city
streetAddress
landmark
isDefault
createdAt
updatedAt
```

Relationship:

```txt
One User has many Addresses
```

---

## 5.4 Category

Stores product categories.

Required fields:

```txt
id
name
slug
description
isActive
createdAt
updatedAt
```

Relationship:

```txt
One Category has many Products
```

---

## 5.5 Product

Stores handmade product information.

Required fields:

```txt
id
categoryId
name
slug
shortDescription
description
productStory
material
careInstructions
makingTime
price
compareAtPrice
stock
stockType
isCustomizable
isGiftSupported
isActive
createdAt
updatedAt
```

Rules:

* Product slug must be unique.
* Price must not be negative.
* Stock must not be negative.
* Product should support stock types:

  * READY_STOCK
  * MADE_TO_ORDER
  * PRE_ORDER
  * OUT_OF_STOCK

---

## 5.6 ProductImage

Stores product image URLs.

Required fields:

```txt
id
productId
imageUrl
publicId
isPrimary
createdAt
```

Relationship:

```txt
One Product has many ProductImages
```

---

## 5.7 Cart

Stores customer cart.

Required fields:

```txt
id
userId
sessionId
createdAt
updatedAt
```

Relationship:

```txt
One User has one Cart
One Cart has many CartItems
```

---

## 5.8 CartItem

Stores products inside cart.

Required fields:

```txt
id
cartId
productId
customizationRequestId
quantity
priceSnapshot
createdAt
updatedAt
```

Rules:

* Quantity must be greater than zero.
* Final checkout price must be recalculated from backend.

---

## 5.9 Order

Stores customer orders.

Required fields:

```txt
id
userId
addressId
orderNumber
subtotal
couponDiscount
gemsDiscount
customizationFee
giftWrapFee
shippingFee
totalAmount
paymentMethod
paymentStatus
orderStatus
createdAt
updatedAt
```

Rules:

* Order number must be unique.
* Final total must be calculated on backend.
* Rewards should be added only after delivery.
* Payment status should only become PAID after backend verification.

---

## 5.10 OrderItem

Stores products inside an order.

Required fields:

```txt
id
orderId
productId
customizationRequestId
productNameSnapshot
priceSnapshot
quantity
createdAt
```

Rules:

* Store product name and price snapshot because product details may change later.

---

## 5.11 Payment

Stores payment details.

Required fields:

```txt
id
orderId
provider
providerTransactionId
amount
status
rawResponse
createdAt
updatedAt
```

Rules:

* Store raw payment response for debugging.
* Online payment must be verified from backend.

---

## 5.12 GiftOption

Stores gift message and gift wrapping details.

Required fields:

```txt
id
orderId
receiverName
senderName
giftMessage
giftWrapRequired
giftWrapFee
printStatus
createdAt
updatedAt
```

Gift print statuses:

```txt
PENDING
PRINTED
ATTACHED
```

---

## 5.13 CustomizationRequest

Stores handmade customization requests.

Required fields:

```txt
id
userId
productId
customText
colorPreference
sizePreference
designNote
neededByDate
customizationFee
status
adminNote
createdAt
updatedAt
```

Customization statuses:

```txt
PENDING_REVIEW
APPROVED
NEEDS_CLARIFICATION
IN_PRODUCTION
COMPLETED
REJECTED
```

---

## 5.14 CustomizationReferenceImage

Stores reference images for custom orders.

Required fields:

```txt
id
customizationRequestId
imageUrl
publicId
createdAt
```

---

## 5.15 Coupon

Stores coupon codes.

Required fields:

```txt
id
code
title
description
discountType
discountValue
minimumOrderAmount
maximumDiscountAmount
usageLimit
usedCount
perUserLimit
startsAt
expiresAt
isActive
createdAt
updatedAt
```

Coupon types:

```txt
PERCENTAGE_DISCOUNT
FIXED_DISCOUNT
FREE_SHIPPING
FREE_GIFT_WRAP
```

Rules:

* Coupon code must be unique.
* Coupon validation must happen on backend.

---

## 5.16 CouponRedemption

Stores coupon usage history.

Required fields:

```txt
id
couponId
userId
orderId
discountAmount
usedAt
```

Purpose:

* Prevent coupon abuse.
* Enforce per-user usage limit.

---

## 5.17 RewardWallet

Stores customer gems balance.

Required fields:

```txt
id
userId
balance
lifetimeEarned
lifetimeSpent
createdAt
updatedAt
```

Rules:

* One user has one reward wallet.
* Balance should not become negative.

---

## 5.18 RewardTransaction

Stores gems transaction history.

Required fields:

```txt
id
userId
orderId
type
gems
description
expiresAt
createdAt
```

Reward transaction types:

```txt
PURCHASE_REWARD
FIRST_PURCHASE_BONUS
REFERRAL_REWARD
REVIEW_REWARD
REDEEMED
EXPIRED
REFUNDED
ADMIN_ADJUSTMENT
```

---

## 5.19 ReferralCode

Stores customer referral code.

Required fields:

```txt
id
userId
code
totalReferrals
successfulReferrals
isActive
createdAt
updatedAt
```

Rules:

* Referral code must be unique.
* One user has one referral code.

---

## 5.20 Referral

Stores referral relationship.

Required fields:

```txt
id
referrerUserId
referredUserId
referralCode
status
rewardGiven
qualifyingOrderId
createdAt
updatedAt
```

Referral statuses:

```txt
REGISTERED
FIRST_ORDER_PLACED
QUALIFIED
REWARDED
CANCELLED
```

Rules:

* Self-referral must not be allowed.
* Referral reward should be given only after referred customer's first delivered order.

---

## 5.21 Review

Stores product reviews.

Required fields:

```txt
id
userId
productId
orderId
rating
comment
status
createdAt
updatedAt
```

Review statuses:

```txt
PENDING
APPROVED
HIDDEN
DELETED
```

Rules:

* Rating should be between 1 and 5.
* Only customers who purchased the product should review it.

---

## 5.22 OrderStatusHistory

Stores order status changes.

Required fields:

```txt
id
orderId
oldStatus
newStatus
changedBy
note
createdAt
```

Purpose:

* Track admin/customer order status changes.
* Useful for audit and debugging.

---

## 6. Important Relationships

```txt
User -> CustomerProfile: one-to-one
User -> Address: one-to-many
User -> Cart: one-to-one
User -> Order: one-to-many
User -> RewardWallet: one-to-one
User -> ReferralCode: one-to-one
Category -> Product: one-to-many
Product -> ProductImage: one-to-many
Cart -> CartItem: one-to-many
Order -> OrderItem: one-to-many
Order -> Payment: one-to-one
Order -> GiftOption: optional one-to-one
Coupon -> CouponRedemption: one-to-many
CustomizationRequest -> CustomizationReferenceImage: one-to-many
Product -> Review: one-to-many
Order -> OrderStatusHistory: one-to-many
```

---

## 7. Important Constraints

Unique constraints:

```txt
users.email
users.phone
categories.slug
products.slug
orders.orderNumber
coupons.code
referralCodes.code
rewardWallets.userId
referralCodes.userId
```

Recommended indexes:

```txt
users.phone
users.email
products.slug
products.categoryId
products.isActive
orders.userId
orders.orderStatus
orders.paymentStatus
orders.createdAt
coupons.code
rewardTransactions.userId
referrals.referrerUserId
referrals.referredUserId
reviews.productId
```

---

## 8. Business Rules

```txt
- Passwords must be hashed.
- Product price must be validated from database during checkout.
- Order total must be calculated on backend.
- Payment must be verified on backend.
- Gems must be added only after order delivery.
- First purchase bonus must be added only once.
- Referral reward must be added only after referred user's first delivered order.
- Coupon usage must be stored.
- Gift message print status must be tracked.
- Customization request status must be tracked.
```

---

## 9. Sprint 2 Goal

Sprint 2 should only create:

```txt
- Prisma schema
- Prisma enums
- Prisma model relations
- Database constraints
- Indexes
```

Sprint 2 should not create:

```txt
- API routes
- Controllers
- Services
- Auth logic
- Product logic
- Cart logic
- Order logic
- Payment logic
- Frontend code
```
