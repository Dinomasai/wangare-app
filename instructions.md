# Claude Code Prompt — Wangare App: Codebase Review, Pesapal Integration & Frontend-Backend Integration Plan

> Paste this entire prompt into Claude Code at the root of the `wangare-app` project.

---

## Constraints (apply to ALL stages)

- Do NOT include `Co-authored-by` in any commit message
- All work goes on a new branch off `dev`: `feat/pesapal-frontend-backend-integration`
- Commit after each stage using the exact commit message provided
- Stop and summarize findings after each stage before continuing
- Do not modify unrelated code
- Run `npx tsc --noEmit` (or the project's type-check) after each code change
- Run the linter if configured (`npm run lint`)
- Use the project's package manager (check for lock files)

---

## STAGE 1: Codebase Reconnaissance (DO NOT write any code)

**Objective:** Fully understand the project before making any changes. Read, trace, and report.

### 1a. Project Structure
- Run `find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | head -80` to map the codebase
- Identify the framework versions: check `package.json` for Next.js, React, Express, Node
- Identify if this is a monorepo (separate `client/` and `server/` dirs) or a single Next.js app with API routes
- Map the directory structure: pages/routes, components, API routes, services, models, middleware, config, public assets

### 1b. Frontend Architecture
- Identify the routing system (App Router vs Pages Router)
- Identify state management (Redux, Zustand, Context, etc.)
- Identify styling approach (Tailwind, CSS Modules, styled-components, etc.)
- List all pages/routes and their purpose
- Find the UI component library if any (shadcn, MUI, Ant Design, etc.)
- Check for authentication system and how it's implemented on the frontend
- Identify data fetching patterns (fetch, axios, SWR, React Query, server components)

### 1c. Backend Architecture
- Identify the backend: is it Express.js in a separate folder, or Next.js API routes, or both?
- Map all API endpoints: `grep -rn "router\.\|app\.\(get\|post\|put\|patch\|delete\)" --include="*.ts" --include="*.js" server/ src/api/ src/app/api/ 2>/dev/null`
- Identify the database: check for Prisma, Mongoose, Sequelize, Knex, or raw SQL
- Read the database schema/models — list all entities (users, products, orders, payments, etc.)
- Identify middleware: auth, validation, error handling, CORS, rate limiting
- Check for environment variables: read `.env.example` or `.env.sample` or grep for `process.env`

### 1d. Payment System (M-Pesa) — CRITICAL
- Search for ALL M-Pesa related code: `grep -rni "mpesa\|m-pesa\|safaricom\|daraja\|stk.*push\|lipa.*na\|b2c\|c2b\|stkpush" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l`
- For each file found, read it fully and document:
  - What M-Pesa API endpoints are called (STK Push, C2B, B2C, transaction status, etc.)
  - How payment initiation works (frontend → backend flow)
  - How callbacks/webhooks are handled
  - How payment status is tracked and stored in the database
  - How payment confirmation is communicated back to the frontend
  - Any M-Pesa-specific models/schemas in the database
- Search for payment-related environment variables: `grep -rni "MPESA\|CONSUMER_KEY\|CONSUMER_SECRET\|PASSKEY\|SHORTCODE\|CALLBACK" --include="*.env*" --include="*.ts" --include="*.js" .`
- Document the complete payment flow: user clicks pay → what happens step by step → order marked as paid

### 1e. Frontend-Backend Integration Points
- How does the frontend communicate with the backend? (direct API calls, proxy, server components)
- Is there a shared types/interfaces file?
- How is authentication passed between frontend and backend (JWT, cookies, sessions)?
- Check CORS configuration
- Check if there's an API client/service layer on the frontend
- Identify any WebSocket or real-time connections

### 1f. Code Quality Scan
- `grep -rn "console.log" --include="*.ts" --include="*.tsx" --include="*.js" src/ server/ app/ 2>/dev/null | wc -l` — count console.logs
- `grep -ri "todo\|fixme\|hack\|xxx" --include="*.ts" --include="*.tsx" --include="*.js" src/ server/ app/ 2>/dev/null` — find tech debt markers
- `grep -ri "api_key\|secret\|password\|token" --include="*.ts" --include="*.tsx" --include="*.js" -l 2>/dev/null` — check for hardcoded secrets (exclude .env files)
- Check for error handling patterns: are errors caught? Are there error boundaries?
- Check for input validation on API routes
- Check for SQL injection / NoSQL injection vulnerabilities

**After completing Stage 1, produce a structured findings report covering each subsection (1a–1f). Do not proceed until the report is complete.**

**Commit:** `docs: add codebase reconnaissance report for wangare-app`

---

## STAGE 2: Generate Findings Report

**Objective:** Create a `CODEBASE_REVIEW_REPORT.md` in the project root summarizing all Stage 1 findings.

### Report Structure

```markdown
# Wangare App — Codebase Review Report

## 1. Project Overview
- Tech stack summary
- Framework versions
- Project structure (monorepo vs single app)

## 2. Frontend Analysis
- Routing and page inventory
- State management
- Styling system
- Component architecture
- Data fetching patterns
- Authentication flow (frontend side)

## 3. Backend Analysis
- API architecture (Express vs API routes)
- Database and ORM
- API endpoint inventory (table: method, path, purpose, auth required?)
- Middleware stack
- Environment variables inventory

## 4. Current Payment System (M-Pesa)
- Architecture diagram (text-based)
- Complete payment flow (step by step)
- Files involved (with line references)
- Database schema for payments
- Webhook/callback handling
- Known issues or gaps

## 5. Frontend-Backend Integration Assessment
- Communication patterns
- Shared types/interfaces
- Authentication flow (end to end)
- CORS and security
- API client/service layer

## 6. Code Quality & Security
- Console.log count
- Hardcoded secrets (if any)
- TODO/FIXME items
- Error handling gaps
- Input validation coverage
- Security vulnerabilities found

## 7. Integration Readiness Score
Rate each area (Ready / Needs Work / Critical):
- API structure
- Database schema
- Authentication
- Error handling
- Type safety
- Payment system modularity
```

**Commit:** `docs: generate codebase review findings report`

---

## STAGE 3: Remove M-Pesa and Integrate Pesapal (Backend)

**Objective:** Replace all M-Pesa/Daraja API code with Pesapal API 3.0 on the backend.

### 3a. Install Pesapal dependency
```bash
npm install pesapaljs-v3
```

### 3b. Create Pesapal service module

Create a new service file (e.g., `services/pesapal.service.ts` or `services/pesapal.js`) that wraps the Pesapal SDK:

```
pesapaljs-v3 API Reference:
- init({ key, secret, debug }) → Initialize with credentials
- authenticate() → Get bearer token (valid 5 min)
- register_ipn_url({ url, ipn_notification_type }) → Register webhook URL
- get_ipn_list() → List registered IPNs
- submit_order({ id, currency, amount, description, callback_url, notification_id, billing_address }) → Create payment, returns redirect URL
- get_transaction_status({ OrderTrackingId }) → Check payment status
```

The service should expose these methods:
1. `initializePesapal()` — call `init()` and `authenticate()`
2. `registerIPN(ipnUrl: string)` — register the IPN callback URL
3. `createPayment(orderDetails)` — map your order data to Pesapal's `submit_order` format, return the redirect URL
4. `checkPaymentStatus(orderTrackingId)` — query transaction status
5. `handleIPN(ipnData)` — process incoming IPN notifications, update order status in DB

### 3c. Create Pesapal routes/controller

Replace the M-Pesa routes with Pesapal equivalents:
- `POST /api/payments/initiate` — create a payment session, return Pesapal redirect URL or iframe URL
- `GET /api/payments/callback` — handle redirect after payment (Pesapal redirects user here with OrderTrackingId and OrderMerchantReference)
- `POST /api/payments/ipn` or `GET /api/payments/ipn` — receive IPN notifications from Pesapal (match `ipn_notification_type` you registered: GET or POST)
- `GET /api/payments/status/:orderTrackingId` — check payment status on demand

### 3d. Update database/models

- Keep existing payment/order schema fields that are generic (amount, currency, status, user, order reference)
- Remove M-Pesa-specific fields (MpesaReceiptNumber, PhoneNumber for STK, CheckoutRequestID, etc.)
- Add Pesapal-specific fields: `pesapalOrderTrackingId`, `pesapalMerchantReference`, `pesapalPaymentMethod`, `pesapalTransactionStatus`
- Create a migration if using Prisma/Sequelize, or update the Mongoose schema

### 3e. Update environment variables

Remove M-Pesa env vars and add Pesapal ones:

```
# REMOVE these:
# MPESA_CONSUMER_KEY=
# MPESA_CONSUMER_SECRET=
# MPESA_PASSKEY=
# MPESA_SHORTCODE=
# MPESA_CALLBACK_URL=
# MPESA_ENV=

# ADD these:
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_IPN_URL=https://yourdomain.com/api/payments/ipn
PESAPAL_CALLBACK_URL=https://yourdomain.com/api/payments/callback
PESAPAL_ENV=sandbox  # or 'live'
```

Update `.env.example` accordingly.

### 3f. Delete M-Pesa files

- Remove the old M-Pesa service/utility files entirely
- Remove M-Pesa routes
- Remove M-Pesa-specific middleware (e.g., STK Push callback validation)
- Clean up any M-Pesa imports across the codebase
- Verify: `grep -rni "mpesa\|daraja\|safaricom\|stk.*push" --include="*.ts" --include="*.js" .` should return zero results (excluding git history)

### 3g. Error handling and security

- Validate all incoming IPN payloads — verify they originate from Pesapal
- Never log full payment credentials
- Handle token expiry (Pesapal tokens last 5 min) — implement auto-refresh
- Add proper try/catch around all Pesapal API calls
- Return user-friendly error messages to the frontend

**Commit:** `feat(payments): replace M-Pesa with Pesapal API v3 integration`

---

## STAGE 4: Update Frontend Payment Flow

**Objective:** Update the frontend to work with Pesapal instead of M-Pesa.

### 4a. Find and update payment UI components
- Search for all payment-related components: `grep -rni "payment\|checkout\|pay\|mpesa" --include="*.tsx" --include="*.jsx" -l`
- Remove M-Pesa-specific UI (phone number input for STK Push, M-Pesa logo, M-Pesa instructions)
- Replace with Pesapal flow:
  1. User clicks "Pay Now" → frontend calls `POST /api/payments/initiate` with order details
  2. Backend returns `{ redirect_url: "https://pay.pesapal.com/..." }` (or iframe URL)
  3. Frontend either redirects user to Pesapal's payment page OR loads it in an iframe
  4. After payment, Pesapal redirects user to your callback URL
  5. Callback page queries payment status and shows confirmation

### 4b. Update payment API client
- Update the frontend API service/client to call the new Pesapal endpoints
- Remove any M-Pesa-specific request shapes (phone number, STK push polling)
- Add proper loading states, error states, and success states

### 4c. Create/update payment status page
- After Pesapal redirects back to your callback URL, parse `OrderTrackingId` from query params
- Call `GET /api/payments/status/:orderTrackingId` to confirm payment
- Show appropriate UI: success (with order details), pending (with retry/check button), failed (with retry option)

### 4d. Update order history / payment history
- If there's an order history or payment history page, ensure it displays Pesapal transaction details instead of M-Pesa receipt numbers

### 4e. Remove M-Pesa references from UI
- Remove M-Pesa branding, logos, instructions
- Add Pesapal branding if required by their terms
- Update any "How to Pay" or FAQ sections

**Commit:** `feat(frontend): update payment UI for Pesapal integration`

---

## STAGE 5: Frontend-Backend Integration Hardening

**Objective:** Ensure the frontend and backend communicate cleanly and securely.

### 5a. Shared Types/Interfaces
If TypeScript, create or update a shared types file (e.g., `types/payment.ts` or `shared/types.ts`):
```typescript
interface PaymentInitiateRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
}

interface PaymentInitiateResponse {
  success: boolean;
  redirectUrl: string;
  orderTrackingId: string;
  merchantReference: string;
}

interface PaymentStatusResponse {
  success: boolean;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionDate: string;
}
```

### 5b. API Client Consistency
- Ensure all API calls use a centralized API client (axios instance or fetch wrapper)
- Include auth headers automatically
- Handle 401/403 responses globally (redirect to login)
- Handle network errors gracefully

### 5c. CORS and Proxy
- If frontend and backend run on different ports, verify CORS is configured correctly for Pesapal callback URLs
- If using Next.js rewrites/proxy, update `next.config.js` accordingly

### 5d. Environment-aware configuration
- Ensure Pesapal sandbox vs. production is controlled by `PESAPAL_ENV` or `NODE_ENV`
- Sandbox URL: `cybqa.pesapal.com`
- Production URL: `pay.pesapal.com`

### 5e. Integration tests
- Test the complete flow end-to-end using Pesapal sandbox:
  1. Create an order
  2. Initiate payment → get redirect URL
  3. Simulate callback with OrderTrackingId
  4. Query status → confirm COMPLETED
  5. Verify order status updated in database

**Commit:** `feat(integration): harden frontend-backend communication and shared types`

---

## STAGE 6: Integration Plan Document

**Objective:** Create `INTEGRATION_PLAN.md` in the project root.

### Document Structure

```markdown
# Wangare App — Frontend-Backend Integration Plan

## 1. Architecture Overview
- Diagram: Frontend ↔ Backend ↔ Pesapal ↔ Database
- Tech stack summary
- Authentication flow

## 2. API Contract
Table of all endpoints:
| Method | Path | Request Body | Response | Auth Required |
|--------|------|-------------|----------|---------------|

## 3. Payment Flow (Pesapal)
Step-by-step flow with sequence:
1. User adds items to cart
2. User proceeds to checkout
3. Frontend sends POST /api/payments/initiate
4. Backend creates order in DB, calls Pesapal submit_order
5. Backend returns redirect URL to frontend
6. Frontend redirects user to Pesapal
7. User completes payment on Pesapal
8. Pesapal redirects user to callback URL
9. Pesapal sends IPN to backend webhook
10. Backend verifies payment, updates order status
11. Frontend shows confirmation

## 4. Environment Setup
- Required environment variables
- Sandbox vs production configuration
- Pesapal dashboard setup (IPN registration)

## 5. Database Changes
- Removed fields (M-Pesa specific)
- Added fields (Pesapal specific)
- Migration instructions

## 6. Security Considerations
- IPN validation
- Token refresh strategy
- Input validation
- CORS policy

## 7. Testing Strategy
- Sandbox credentials
- Test payment flow
- Edge cases (failed payments, duplicate IPNs, expired tokens)

## 8. Deployment Checklist
- [ ] Pesapal production credentials in env
- [ ] IPN URL registered in Pesapal dashboard
- [ ] Callback URL accessible publicly
- [ ] CORS allows Pesapal domains
- [ ] Database migrations run
- [ ] Old M-Pesa env vars removed
- [ ] Smoke test: complete a payment
```

**Commit:** `docs: create frontend-backend integration plan with Pesapal`

---

## STAGE 7: Final Cleanup and Verification

### 7a. Verify no M-Pesa remnants
```bash
grep -rni "mpesa\|m-pesa\|daraja\|safaricom\|stk.push\|lipa.na\|shortcode\|passkey" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --include="*.json" --include="*.env*" --include="*.md" .
```
This should return zero results (excluding `CODEBASE_REVIEW_REPORT.md` which documents the old system, and git history).

### 7b. Type check
```bash
npx tsc --noEmit
```

### 7c. Lint
```bash
npm run lint
```

### 7d. Verify build
```bash
npm run build
```

### 7e. Update README
- Add Pesapal setup instructions
- Update environment variables section
- Update the "payments" section if one exists

**Commit:** `chore: final cleanup and verification after Pesapal migration`

---

## Branch & Commit Summary

```
Branch: feat/pesapal-frontend-backend-integration (off dev)

Commits (in order):
1. docs: add codebase reconnaissance report for wangare-app
2. docs: generate codebase review findings report
3. feat(payments): replace M-Pesa with Pesapal API v3 integration
4. feat(frontend): update payment UI for Pesapal integration
5. feat(integration): harden frontend-backend communication and shared types
6. docs: create frontend-backend integration plan with Pesapal
7. chore: final cleanup and verification after Pesapal migration
```

## How to Start

```bash
git checkout dev
git pull origin dev
git checkout -b feat/pesapal-frontend-backend-integration
```

Then work through each stage sequentially. Do NOT skip stages. Each commit is a checkpoint — summarize findings before proceeding.

## Rules

- No `Co-authored-by` in any commit
- No `console.log` in production code (use a proper logger or remove)
- All API responses: `{ success: boolean, data?: any, error?: string }`
- Never log payment credentials or full card/phone numbers
- Always handle Pesapal token expiry (5-minute TTL)
- Keep each file under 200 lines where possible — extract utilities
- Use async/await everywhere, no callback chains