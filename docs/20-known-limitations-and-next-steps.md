# Known Limitations and Next Steps

## Known Limitations

- Khalti/eSewa merchant keys are pending.
- Khalti/eSewa live backend verification is pending.
- Cloudinary credentials are pending for image upload routes.
- Automatic rewards after delivery are pending.
- Automatic referral rewards are pending.
- Frontend implementation is pending.
- OTP/email verification is pending.
- Automated tests are pending.
- Checkout currently accepts `CASH_ON_DELIVERY` only.
- Logout is stateless and does not revoke refresh tokens server-side.

## Notes by Area

## Payments

Khalti and eSewa initiation endpoints are scaffolded, but real gateway credentials are required. Verification endpoints currently return `501` after basic checks because live backend verification is not complete.

Admin payment status update can be used for manual QA and syncs payment status back to the order.

## Rewards

Reward wallets and transactions exist. Admin adjustment is available. Automatic purchase rewards, first-purchase bonuses, review rewards, and referral rewards should be implemented in a later sprint.

## Referrals

Referral code creation, application, listing, and admin status updates exist. Reward credit for qualified referrals is intentionally pending.

## Uploads

Upload routes require Cloudinary credentials. Without credentials, upload routes return `503`.

## Frontend

Frontend pages and API integration are pending. Backend docs and manual QA commands are ready to support frontend implementation.

## Automated Testing

Automated tests should be planned as a dedicated sprint. Recommended next steps:

- Choose test runner and API testing strategy.
- Add isolated test database configuration.
- Add seed and cleanup scripts.
- Add auth helper for customer/admin tokens.
- Cover critical flows first: auth, cart, checkout, payments, admin role protection, and validation errors.

## Recommended Next Sprint

Start frontend work only after backend QA has been completed against the testing guide, or start an automated backend testing sprint if backend stability is the priority.
