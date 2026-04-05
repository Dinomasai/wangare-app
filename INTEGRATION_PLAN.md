# Wangare App — Frontend-Backend Integration Plan

## 1. Architecture Overview

```
Browser (React SPA)
    │
    │ /api/* → proxy (dev) or direct (prod)
    ▼
Express.js Server (port 4000)
    ├── /api/products   — Product catalog
    ├── /api/reels      — Video reels
    ├── /api/orders     — Order management
    ├── /api/admin      — Auth + admin
    └── /api/payments   — Pesapal payment flow
              │
              │ pesapaljs-v3 SDK
              ▼
        Pesapal API v3
        (cybqa.pesapal.com — sandbox)
        (pay.pesapal.com   — live)
              │
              │ IPN (GET /api/payments/ipn)
              ▼
        JSON flat-file store (server/data/)
```

**Tech Stack**
- Frontend: React 19, React Router 7, Tailwind CSS 4, Vite 8
- Backend: Express.js 5, Node.js ESM, pesapaljs-v3
- Storage: JSON flat files (no database)
- Auth: JWT (admin only; customers are anonymous)

**Authentication Flow**
1. Admin POSTs credentials → `/api/admin/login` → receives JWT (24h TTL)
2. JWT stored in `localStorage.adminToken`
3. All admin API calls include `Authorization: Bearer <token>`
4. `verifyToken` middleware protects admin routes

---

## 2. API Contract

| Method | Path | Request Body | Response | Auth |
|--------|------|-------------|----------|------|
| GET | `/api/products` | — | `[Product]` | No |
| GET | `/api/products/:id` | — | `Product` | No |
| POST | `/api/products` | `FormData` | `Product` | Admin |
| PUT | `/api/products/:id` | `FormData` | `Product` | Admin |
| DELETE | `/api/products/:id` | — | `{message}` | Admin |
| DELETE | `/api/products/:id/image` | `{imagePath}` | `{message}` | Admin |
| GET | `/api/reels` | — | `[Reel]` | No |
| POST | `/api/reels` | `FormData` | `Reel` | Admin |
| PUT | `/api/reels/:id` | `FormData` | `Reel` | Admin |
| DELETE | `/api/reels/:id` | — | `{message}` | Admin |
| POST | `/api/orders` | `{customer, items, total, paymentMethod}` | `Order` | No |
| GET | `/api/orders` | — | `[Order]` | Admin |
| PUT | `/api/orders/:id` | `{status}` | `Order` | Admin |
| DELETE | `/api/orders/:id` | — | `{message}` | Admin |
| POST | `/api/admin/login` | `{username, password}` | `{token, username}` | No |
| GET | `/api/admin/verify` | — | `{valid, username}` | Admin |
| PUT | `/api/admin/password` | `{currentPassword, newPassword}` | `{message}` | Admin |
| POST | `/api/payments/initiate` | `PaymentInitiateRequest` | `PaymentInitiateResponse` | No |
| GET | `/api/payments/callback` | query: `OrderTrackingId, OrderMerchantReference` | `{success, data}` | No |
| GET | `/api/payments/ipn` | query: `OrderTrackingId, OrderMerchantReference, OrderNotificationType` | Pesapal ACK | No |
| GET | `/api/payments/status/:orderTrackingId` | — | `PaymentStatusResponse` | No |
| POST | `/api/payments/register-ipn` | — | `{success, data}` | No |

**Standard response shape:**
```json
{ "success": true, "data": {} }
{ "success": false, "error": "Human-readable message" }
```

---

## 3. Payment Flow (Pesapal)

```
1.  User adds items to cart
2.  User navigates to /checkout
3.  User fills: Full Name, Email, Delivery Location (phone optional)
4.  User clicks "Pay KSh X"
5.  Frontend: POST /api/orders  →  creates order (status: pending, paymentMethod: pesapal)
6.  Frontend: POST /api/payments/initiate
        Body: { orderId, amount, currency, description, customerEmail,
                customerFirstName, customerLastName, customerPhone }
7.  Backend: calls pesapal.authenticate() (auto-refresh if token < 30s to expiry)
8.  Backend: calls pesapal.submit_order(...)
9.  Pesapal returns: { order_tracking_id, merchant_reference, redirect_url }
10. Backend: saves pesapalOrderTrackingId + pesapalMerchantReference to order
11. Backend: returns { success: true, data: { redirectUrl, orderTrackingId, merchantReference } }
12. Frontend: opens WhatsApp notification to owner, clears cart
13. Frontend: window.location.href = redirectUrl  (user goes to Pesapal)
14. User completes payment on Pesapal (M-Pesa, card, etc.)
15. Pesapal redirects user to PESAPAL_CALLBACK_URL
        e.g. https://yourdomain.com/payment/status
        ?OrderTrackingId=...&OrderMerchantReference=...
16. Frontend /payment/status page reads query params
17. Frontend: GET /api/payments/status/:orderTrackingId
18. Backend: calls pesapal.get_transaction_status({ OrderTrackingId })
19. Backend: returns { success, data: { status, amount, currency, paymentMethod, transactionDate } }
20. Frontend: shows COMPLETED / PENDING / FAILED / CANCELLED UI

Separately (async IPN):
15b. Pesapal: GET /api/payments/ipn?OrderTrackingId=...&OrderMerchantReference=...
16b. Backend: queries transaction status from Pesapal
17b. Backend: updates order { pesapalTransactionStatus, pesapalPaymentMethod, status }
18b. Backend: returns Pesapal ACK response
```

---

## 4. Environment Setup

### Required Environment Variables
```env
PORT=4000
JWT_SECRET=<long random string>

PESAPAL_CONSUMER_KEY=<from Pesapal developer dashboard>
PESAPAL_CONSUMER_SECRET=<from Pesapal developer dashboard>
PESAPAL_ENV=sandbox          # or "live"

PESAPAL_IPN_URL=https://yourdomain.com/api/payments/ipn
PESAPAL_CALLBACK_URL=https://yourdomain.com/payment/status

PESAPAL_IPN_ID=              # optional; auto-fetched/registered if blank
```

### Sandbox vs Production
| Setting | Sandbox | Production |
|---------|---------|-----------|
| `PESAPAL_ENV` | `sandbox` | `live` |
| Pesapal API | `cybqa.pesapal.com` | `pay.pesapal.com` |
| Credentials | Pesapal sandbox keys | Pesapal live keys |

### Pesapal Dashboard Setup
1. Create account at https://developer.pesapal.com
2. Get `Consumer Key` and `Consumer Secret` from the dashboard
3. Register IPN URL: POST to `/api/payments/register-ipn` once server is running
4. Set `PESAPAL_IPN_ID` to the returned `ipn_id` value
5. Configure `PESAPAL_CALLBACK_URL` to your frontend `/payment/status` route

### Local Development with ngrok
```bash
ngrok http 4000
# Copy the https URL, e.g. https://abc123.ngrok.io
# Set PESAPAL_IPN_URL=https://abc123.ngrok.io/api/payments/ipn
# Set PESAPAL_CALLBACK_URL=https://abc123.ngrok.io/payment/status
```

---

## 5. Database Changes

### Removed Fields (M-Pesa specific)
These fields no longer exist in order records:
- `MpesaReceiptNumber`
- `CheckoutRequestID`
- `MerchantRequestID`

### Added Fields (Pesapal specific)
New fields on every order:
```json
{
  "pesapalOrderTrackingId": "string | null",
  "pesapalMerchantReference": "string | null",
  "pesapalTransactionStatus": "COMPLETED | PENDING | FAILED | CANCELLED | null",
  "pesapalPaymentMethod": "string | null"
}
```

### Migration Instructions
JSON flat files don't require a migration script. Existing orders without the new fields will simply have `undefined` for those properties. New orders will include all four fields initialized to `null`.

---

## 6. Security Considerations

### IPN Validation
The current IPN endpoint accepts any request matching the query param structure. For production, validate that the `OrderTrackingId` exists in your database before processing, and always re-verify the status with Pesapal before updating order state (already implemented).

### Token Refresh Strategy
- Pesapal tokens expire in 5 minutes
- `pesapal.service.js` tracks `tokenExpiresAt` and re-authenticates automatically when the token is within 30 seconds of expiry
- All calls go through `initializePesapal()` which handles this transparently

### Input Validation
- Payment initiation validates: required fields, positive numeric amount
- Orders validate: customer, items, total presence
- Admin login relies on bcrypt comparison

### CORS Policy
Current: `cors()` — wildcard (all origins)
For production: restrict to your frontend domain:
```js
app.use(cors({ origin: "https://yourdomain.com" }));
```

---

## 7. Testing Strategy

### Sandbox Credentials
Obtain from https://developer.pesapal.com → set `PESAPAL_ENV=sandbox`

### Test Payment Flow
1. Start backend: `npm run server`
2. Start frontend: `npm run dev`
3. Expose backend via ngrok, update `.env` with ngrok URLs
4. Register IPN: `curl -X POST http://localhost:4000/api/payments/register-ipn`
5. Add items to cart, proceed to checkout
6. Fill name, email, location → click Pay
7. Complete payment on Pesapal sandbox
8. Verify redirect to `/payment/status` shows COMPLETED
9. Check `server/data/orders.json` for updated `pesapalTransactionStatus: "COMPLETED"`

### Edge Cases
| Scenario | Expected Behavior |
|----------|------------------|
| User closes browser before redirecting | IPN updates order when Pesapal fires it |
| Token expired mid-flow | `initializePesapal()` auto-refreshes before each call |
| Duplicate IPN fired | Re-fetches status; idempotent update to order |
| Payment failed | `/payment/status` shows FAILED with retry link |
| Payment cancelled | `/payment/status` shows CANCELLED with retry link |
| Invalid `orderTrackingId` | Pesapal returns error; status endpoint returns 500 |

---

## 8. Deployment Checklist

- [ ] Set `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` (live credentials)
- [ ] Set `PESAPAL_ENV=live`
- [ ] Set `PESAPAL_IPN_URL` to public backend URL
- [ ] Set `PESAPAL_CALLBACK_URL` to public frontend `/payment/status` URL
- [ ] Register IPN URL with Pesapal (POST `/api/payments/register-ipn`)
- [ ] Set `PESAPAL_IPN_ID` to the returned value
- [ ] Set strong `JWT_SECRET` (minimum 32 random characters)
- [ ] Restrict CORS to production domain in `server/index.js`
- [ ] Verify HTTPS on both frontend and backend domains
- [ ] Run smoke test: complete a full payment end-to-end
- [ ] Confirm `server/data/orders.json` is writable by the server process
- [ ] Remove hardcoded default from `JWT_SECRET` in `admin.js` (or ensure env is always set)
