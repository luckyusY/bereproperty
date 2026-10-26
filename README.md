# Toolbay Marketplace

Toolbay is a responsive Rwanda marketplace for construction materials, tools, and equipment. The React app includes a multi-route buyer catalog, supplier storefronts, saved products, guest and account baskets, manual order requests, seller inventory and order management, and two construction calculators. The Express API stores accounts, stores, products, baskets, and orders in MongoDB; seller listing images upload to Cloudinary.

## Local setup

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env` in the project root and configure `MONGODB_URI` and a unique `JWT_SECRET` of at least 32 characters. Configure the Cloudinary values to enable seller image uploads. `.env` is ignored by Git.
3. In MongoDB Atlas, allow the API host's IP and use a database user with access only to the dedicated `toolbay` database. The app does not delete or modify other databases.
4. Run `npm run server` in one terminal and `npm run dev` in another. Open `http://localhost:5173`.
5. Use `npm run build` to create the static production bundle.

The Vite dev server proxies `/api` to `http://localhost:5000`. For production, place the API behind the same origin or configure `VITE_API_BASE_URL` at frontend build time to the API's public `/api` URL and set `CLIENT_ORIGIN` on the API. Cross-origin cookie sessions need HTTPS and compatible cookie settings at deployment.

## Product behavior

- Without a reachable API, the public catalog falls back to clearly marked sample listings so the browsing experience can be previewed. Accounts, checkout, and seller operations require the configured API and MongoDB.
- Buyers can keep a basket as a guest. Signing in merges it into the buyer's MongoDB basket. Checkout creates a separate request for every supplier with item price snapshots.
- Orders remain `requested` with `pending_manual` payment status. Toolbay does not collect payments online; buyer and seller coordinate payment and delivery directly.
- Seller actions are scoped to the authenticated seller's store. Listing removal is a soft delete.
- Product image uploads require Cloudinary configuration; credentials stay on the API server.
- Seller terms and fees are not invented in this app. Direct sellers to Toolbay for current terms.

## Main API routes

Public: `GET /api/health`, `GET /api/categories`, `GET /api/products`, `GET /api/products/:id`, `GET /api/stores/:slug`.

Accounts: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.

Buyer: `GET/PUT /api/cart`, `POST /api/cart/merge`, `POST /api/orders`, `GET /api/account/orders`.

Seller: `GET/POST /api/seller/products`, `PATCH/DELETE /api/seller/products/:id`, `GET /api/seller/orders`, `PATCH /api/seller/orders/:id`.

## Security and launch notes

Keep MongoDB, JWT, and Cloudinary secrets in the API host's environment. Rotate any credential that has been pasted into a public or shared chat before production. Use a dedicated MongoDB database user and restrict its access to the Toolbay catalog. Configure SPA fallback on the frontend host so direct navigation and reload work on routes such as `/products/:id` and `/seller/orders`.

The 3D-like homepage vignette is CSS and image based to keep the first-load bundle light; the layout provides an image fallback and avoids motion under reduced-motion preferences. Payment-provider integration, email verification, and production seller verification are later phases.
