# Wangaré Luxe

A luxury e-commerce web application for a Kenyan fashion brand specializing in high-end bags and accessories. Built with React and Vite, the app delivers a premium shopping experience celebrating African artistry and craftsmanship.

> "Luxury in Every Detail"

## Features

- **Home** — Hero section, featured collection carousel, new arrivals, and brand story
- **Shop** — Browse all products with filtering and sorting
- **Product Details** — Individual product view with images, pricing, and add-to-cart
- **Cart** — Manage cart items, update quantities, and remove products
- **Checkout** — Complete the purchase flow
- **Reels** — Social media video content showcase

## Tech Stack

- [React 19](https://react.dev/) — UI library
- [React Router DOM 7](https://reactrouter.com/) — Client-side routing
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first styling
- [Vite 8](https://vite.dev/) — Build tool with HMR

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/wangare-app.git
cd wangare-app
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 4000) |
| `JWT_SECRET` | Secret for admin JWT signing |
| `PESAPAL_CONSUMER_KEY` | From Pesapal developer dashboard |
| `PESAPAL_CONSUMER_SECRET` | From Pesapal developer dashboard |
| `PESAPAL_ENV` | `sandbox` for testing, `live` for production |
| `PESAPAL_IPN_URL` | Public URL for Pesapal IPN notifications (`/api/payments/ipn`) |
| `PESAPAL_CALLBACK_URL` | Public URL where Pesapal redirects after payment (`/payment/status`) |
| `PESAPAL_IPN_ID` | IPN ID from Pesapal (auto-registered if blank) |

For local development, use [ngrok](https://ngrok.com/) to expose the backend:

```bash
ngrok http 4000
# Then set PESAPAL_IPN_URL and PESAPAL_CALLBACK_URL to your ngrok URL
```

### Development

```bash
# Terminal 1 — Frontend (Vite dev server, port 5173)
npm run dev

# Terminal 2 — Backend (Express, port 4000)
npm run server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Payments

Checkout is powered by **Pesapal v3**, supporting M-Pesa, Visa, Mastercard, and other payment methods.

**Payment flow:**
1. Customer fills checkout form and clicks Pay
2. Backend creates an order and initiates a Pesapal session
3. Customer is redirected to Pesapal's secure payment page
4. After payment, Pesapal redirects back to `/payment/status`
5. Payment status is confirmed and displayed to the customer

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable components (Navbar, Footer, ProductCard)
├── context/         # React Context (CartContext, AdminContext)
├── data/            # Product data
├── pages/           # Route-level pages
├── types/           # JSDoc type definitions
├── api.js           # Centralized API client
├── App.jsx
└── main.jsx

server/
├── routes/          # Express route handlers
├── services/        # Business logic (Pesapal service)
└── data/            # JSON flat-file store (orders, products, reels)
```
