# Wangare App — Codebase Review Report

## 1. Project Overview

### Tech Stack Summary
- **Frontend**: React 19.2.4 + Vite 8.0.1 SPA
- **Backend**: Express.js 5.2.1 (separate `server/` folder)
- **Routing**: React Router DOM 7.13.1 (client-side SPA routing)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Auth**: JWT (`jsonwebtoken` 9.0.3) + bcryptjs 3.0.3
- **HTTP Client**: Native `fetch` (frontend) + Axios 1.14.0 (backend M-Pesa calls)
- **File uploads**: Multer 2.1.1
- **No TypeScript** — pure JavaScript throughout

### Framework Versions
| Package | Version |
|---------|---------|
| react | 19.2.4 |
| react-dom | 19.2.4 |
| react-router-dom | 7.13.1 |
| vite | 8.0.1 |
| express | 5.2.1 |
| tailwindcss | 4.2.2 |
| axios | 1.14.0 |

### Project Structure
This is a **single repository** (not a monorepo) with a clear frontend/backend split:
```
wangare-app/
├── src/                    # React frontend (Vite SPA)
│   ├── api.js              # Centralized API client
│   ├── App.jsx             # Root router
│   ├── main.jsx            # Entry point
│   ├── pages/              # Route-level page components
│   ├── components/         # Shared UI components
│   ├── context/            # React Context providers
│   └── data/               # Static data (products.js)
├── server/                 # Express.js backend
│   ├── index.js            # Server entry point (port 4000)
│   ├── routes/             # Route handlers
│   │   ├── admin.js        # Auth + admin management
│   │   ├── mpesa.js        # M-Pesa payment routes
│   │   ├── orders.js       # Order CRUD
│   │   ├── products.js     # Product CRUD + image upload
│   │   └── reels.js        # Reels CRUD + video upload
│   ├── data/               # JSON flat-file "database"
│   │   ├── orders.json
│   │   ├── admin.json
│   │   └── products.json
│   └── uploads/            # Uploaded media files
├── public/                 # Static assets
├── vite.config.js          # Vite config (with /api proxy)
└── package.json
```

---

## 2. Frontend Analysis

### Routing and Page Inventory
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Home` | Landing/hero page |
| `/shop` | `Shop` | Product listing (all categories) |
| `/shop/:category` | `Shop` | Product listing by category |
| `/product/:id` | `ProductDetails` | Single product view |
| `/cart` | `Cart` | Shopping cart |
| `/checkout` | `Checkout` | Checkout + payment flow |
| `/reels` | `Reels` | Video reels page |
| `/admin` | `AdminLogin` | Admin login |
| `/admin/dashboard` | `AdminDashboard` | Admin home (protected) |
| `/admin/products` | `AdminProducts` | Product management (protected) |
| `/admin/products/new` | `AdminProductForm` | Create product (protected) |
| `/admin/products/:id/edit` | `AdminProductForm` | Edit product (protected) |
| `/admin/reels` | `AdminReels` | Reel management (protected) |
| `/admin/orders` | `AdminOrders` | Order management (protected) |

### State Management
- **React Context API** only — no Redux or Zustand
- `CartContext`: cart items, add/remove/update/clear, cartCount, cartTotal
- `AdminContext`: isAdmin flag, loading state, login/logout actions

### Styling System
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- Custom utility classes (e.g., `btn-primary`, `btn-gold`, `animate-fade-in`)
- No external UI component library (MUI, shadcn, etc.)

### Component Architecture
- `Navbar`, `Footer` — site-wide layout
- `AdminLayout` — admin panel shell with sidebar
- `ProductCard` — reusable product tile

### Data Fetching Patterns
- All API calls go through `src/api.js` — centralized fetch wrapper
- No SWR, React Query, or server components
- Authentication header injected via `authHeaders()` helper in `api.js`

### Authentication Flow (Frontend)
1. Admin logs in via `POST /api/admin/login`
2. JWT token stored in `localStorage` as `adminToken`
3. `authHeaders()` reads token and adds `Authorization: Bearer <token>` to all admin requests
4. `AdminContext` verifies token on app load via `GET /api/admin/verify`
5. No customer-facing authentication (customers are anonymous)

---

## 3. Backend Analysis

### API Architecture
**Express.js 5.x** in `server/` — separate from the Vite frontend. The Vite dev server proxies `/api` and `/uploads` to `http://localhost:4000`.

### Database and ORM
- **No database** — all data stored in JSON flat files (`server/data/`)
- **No ORM** — raw `fs.readFileSync`/`fs.writeFileSync`
- No migrations, no schema enforcement, no transactions

### API Endpoint Inventory
| Method | Path | Purpose | Auth Required |
|--------|------|---------|---------------|
| GET | `/api/products` | List products (optional `?category=`) | No |
| GET | `/api/products/:id` | Get single product | No |
| POST | `/api/products` | Create product (multipart) | Yes (admin) |
| PUT | `/api/products/:id` | Update product (multipart) | Yes (admin) |
| DELETE | `/api/products/:id` | Delete product | Yes (admin) |
| DELETE | `/api/products/:id/image` | Remove product image | Yes (admin) |
| GET | `/api/reels` | List reels | No |
| POST | `/api/reels` | Upload reel | Yes (admin) |
| PUT | `/api/reels/:id` | Update reel | Yes (admin) |
| DELETE | `/api/reels/:id` | Delete reel | Yes (admin) |
| POST | `/api/mpesa/stkpush` | Initiate STK Push payment | No |
| POST | `/api/mpesa/callback` | M-Pesa webhook | No |
| POST | `/api/mpesa/query` | Query STK push status | No |
| POST | `/api/admin/login` | Admin login | No |
| PUT | `/api/admin/password` | Change admin password | Yes (admin) |
| GET | `/api/admin/verify` | Verify JWT token | Yes (admin) |
| POST | `/api/orders` | Create order | No |
| GET | `/api/orders` | List all orders | Yes (admin) |
| PUT | `/api/orders/:id` | Update order status | Yes (admin) |
| DELETE | `/api/orders/:id` | Delete order | Yes (admin) |

### Middleware Stack
- `cors()` — wildcard CORS (all origins)
- `express.json()` — JSON body parsing
- `verifyToken` — JWT auth middleware (applied per-route, not globally)
- No rate limiting
- No request logging middleware
- No global error handler

### Environment Variables Inventory
| Variable | Used In | Default / Notes |
|----------|---------|----------------|
| `PORT` | `server/index.js` | `4000` |
| `JWT_SECRET` | `server/routes/admin.js` | Hardcoded fallback `"wangare-luxe-secret-key-change-this"` |
| `MPESA_CONSUMER_KEY` | `server/routes/mpesa.js` | Hardcoded fallback |
| `MPESA_CONSUMER_SECRET` | `server/routes/mpesa.js` | Hardcoded fallback |
| `MPESA_SHORTCODE` | `server/routes/mpesa.js` | `"174379"` (sandbox) |
| `MPESA_PASSKEY` | `server/routes/mpesa.js` | Hardcoded sandbox passkey |
| `MPESA_CALLBACK_URL` | `server/routes/mpesa.js` | `"https://yourdomain.com/api/mpesa/callback"` |
| `MPESA_BASE_URL` | `server/routes/mpesa.js` | `"https://sandbox.safaricom.co.ke"` |

**No `.env.example` exists in the repo.**

---

## 4. Current Payment System (M-Pesa)

### Architecture (Text Diagram)
```
Frontend (Checkout.jsx)
    │
    │ POST /api/mpesa/stkpush {phone, amount, orderId}
    ▼
Backend (mpesa.js)
    │
    │ GET /oauth/v1/generate  (Daraja OAuth)
    │ POST /mpesa/stkpush/v1/processrequest
    ▼
Safaricom Daraja API
    │
    │ Returns {CheckoutRequestID, MerchantRequestID}
    ▼
Backend → Frontend
    │
    │ {success, checkoutRequestId}
    ▼
Frontend polls POST /api/mpesa/query every 5s (max 12× = 60s)
    │
    ├─ ResultCode 0 → payment confirmed → createOrder() + WhatsApp
    └─ 12 attempts → timeout → createOrder() as "processing"

Separately (async, not connected to above):
Safaricom → POST /api/mpesa/callback → console.log only (no DB update)
```

### Complete Payment Flow (Step by Step)
1. User fills form: name, phone (M-Pesa number), delivery location
2. `handleSubmit()` calls `initiateMpesa(phone, cartTotal, orderId)` → `POST /api/mpesa/stkpush`
3. Backend generates OAuth token from Daraja API
4. Backend sends STK Push request to `sandbox.safaricom.co.ke`
5. Backend returns `{ success: true, checkoutRequestId }`
6. Frontend sets status to `"waiting"` and starts polling every 5 seconds
7. Each poll: `POST /api/mpesa/query` → backend queries Daraja for status
8. If `ResultCode === 0`: payment confirmed → call `createOrder()` → open WhatsApp DM to owner
9. If 12 attempts exhausted: create order with "processing" note (assume payment coming)
10. `createOrder()` → `POST /api/orders` → saves to `orders.json`
11. Cart is cleared, success screen shown

### Files Involved
| File | Lines | Role |
|------|-------|------|
| `server/routes/mpesa.js` | 1–100 | STK Push, callback, query endpoints |
| `src/pages/Checkout.jsx` | 1–180 | Payment UI, polling logic, order creation |
| `src/api.js` | `initiateMpesa()`, `queryMpesaStatus()` | API calls |

### Database Schema for Payments
**No dedicated payments table/collection.** Orders include:
```json
{
  "id": 1,
  "customer": { "name": "", "phone": "", "location": "" },
  "items": [{ "id": "", "name": "", "price": 0, "qty": 0, "color": "", "size": "" }],
  "total": 0,
  "paymentMethod": "mpesa",
  "status": "pending",
  "createdAt": "ISO date"
}
```

### Webhook/Callback Handling
- `POST /api/mpesa/callback` exists but **only logs to console** — no order status update
- No IPN validation — anyone can POST to this endpoint
- Payment confirmation relies entirely on the polling mechanism

### Known Issues / Gaps
1. **Callback is non-functional** — M-Pesa IPN data is logged but never persisted
2. **Race condition** — polling can timeout before Safaricom processes the payment
3. **No payment record** — if user closes browser during polling, no way to reconcile
4. **Hardcoded credentials** — sandbox keys hardcoded as fallbacks
5. **No amount validation** — negative amounts not rejected
6. **Phone number input labeled as "M-PESA Phone Number"** — tightly coupled to M-Pesa

---

## 5. Frontend-Backend Integration Assessment

### Communication Patterns
- **Development**: Vite proxy forwards `/api/*` → `http://localhost:4000`
- **Production**: Would require CORS or reverse proxy configuration (not documented)
- All requests use native `fetch` — no Axios on the frontend

### Shared Types/Interfaces
- **None** — pure JavaScript, no TypeScript, no shared type definitions
- API request/response shapes are implicit and undocumented

### Authentication Flow (End to End)
1. Frontend: `POST /api/admin/login` → receives `{ token, username }`
2. Token stored in `localStorage.adminToken`
3. Protected requests: `Authorization: Bearer <token>` header
4. Backend `verifyToken` middleware: decodes JWT, attaches `req.admin`
5. Token expiry: 24 hours (no refresh token mechanism)
6. **No customer auth** — all customer operations are anonymous

### CORS and Security
- `app.use(cors())` — allows all origins, all methods
- No origin whitelist
- No HTTPS enforcement (server runs HTTP only)
- No Helmet.js or security headers

### API Client/Service Layer
- `src/api.js` is a clean, centralized API client
- All API calls exported as named async functions
- Auth headers injected via `authHeaders()` helper
- No global error handling or interceptors

---

## 6. Code Quality & Security

### Console.log Count
**4 console.logs** — all in server files:
- `server/index.js`: server startup message
- `server/routes/mpesa.js`: callback data logging (2 calls)

### Hardcoded Secrets
| File | Secret | Risk |
|------|--------|------|
| `server/routes/admin.js` | `JWT_SECRET` fallback | High — predictable secret in production if env not set |
| `server/routes/mpesa.js` | M-Pesa sandbox credentials | Low (sandbox only, but bad practice) |

### TODO/FIXME Items
None found.

### Error Handling Gaps
- JSON file reads (`fs.readFileSync`) in all route files have no try/catch — any JSON corruption crashes the route
- No global Express error handler
- No 404 handler
- M-Pesa API errors return generic messages (good) but errors are only logged to console

### Input Validation Coverage
- Orders: checks for `customer`, `items`, `total` presence — no type or range validation
- M-Pesa: checks for `phone` and `amount` — no amount validation (negative allowed)
- Admin login: checks username/password — relies on bcrypt for security
- Products: no validation beyond Multer file handling

### Security Vulnerabilities Found
1. **CORS wildcard** — any origin can call admin endpoints (mitigated by JWT requirement)
2. **Hardcoded JWT secret fallback** — if env not set, predictable secret used
3. **No IPN validation** — M-Pesa callback endpoint accepts any POST request
4. **No rate limiting** — login endpoint vulnerable to brute force
5. **No amount validation** — payments could be initiated with `amount: -1`
6. **localStorage JWT** — vulnerable to XSS (no httpOnly cookie)

---

## 7. Integration Readiness Score

| Area | Score | Notes |
|------|-------|-------|
| API structure | **Ready** | Clean REST structure, consistent response patterns |
| Database schema | **Needs Work** | JSON flat files — no transactions, no migrations, no relational integrity |
| Authentication | **Needs Work** | JWT works but hardcoded secret fallback, no refresh tokens, localStorage storage |
| Error handling | **Needs Work** | Missing global handler, unprotected file reads, no input validation |
| Type safety | **Critical** | No TypeScript, no shared types, all implicit |
| Payment system modularity | **Critical** | M-Pesa tightly coupled, IPN callback non-functional, no payment record persistence |
