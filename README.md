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

### Development

```bash
npm run dev
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

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable components (Navbar, Footer, ProductCard)
├── context/         # React Context (CartContext)
├── data/            # Product data
├── pages/           # Route-level pages (Home, Shop, ProductDetails, Cart, Checkout, Reels)
├── App.jsx
└── main.jsx
```
