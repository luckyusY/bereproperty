# BereProperty Marketplace

BereProperty is a responsive Rwanda marketplace for construction materials, tools, and equipment. The React app includes a multi-route buyer catalog, supplier storefronts, saved products, guest and account baskets, manual order requests, seller inventory and order management, and two construction calculators. The Express API stores accounts, stores, products, baskets, orders, and admin audit records in MongoDB; seller listing images upload to Cloudinary.

## Local setup

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env` in the project root. Set the BereProperty `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, and Cloudinary credentials if seller uploads are needed. `.env` is ignored by Git.
3. In MongoDB Atlas, allow the API host's IP. The runtime database user should have access to the dedicated `bereproperty` database.
4. **For an existing catalog, migrate before starting the API:** pause marketplace writes, set `SOURCE_MONGODB_URI` to the current database and `MONGODB_URI` to the new `/bereproperty` database, then run `npm run db:migrate:bereproperty`. Review the printed collection counts. The command copies records and indexes without deleting the source. Keep the source unchanged for rollback, then remove `SOURCE_MONGODB_URI` after cutover verification. For a fresh install, this copy step is not needed.
5. Run `npm run server` and `npm run dev` in separate terminals; open `http://localhost:5173`.
6. After migration (or on a fresh database), seed the first administrator once: set `ADMIN_NAME`, `ADMIN_EMAIL`, and a private `ADMIN_PASSWORD` of at least 16 characters in the server `.env`, then run `npm run admin:create`. The command refuses to seed the wrong database or add a second admin. Remove those three values after it succeeds. Public registration cannot create admins.
7. Run `npm run build` to create the production bundle.
The Vite dev server proxies `/api` to `http://localhost:5000`. For production, place the API behind the same origin or configure `VITE_API_BASE_URL` at frontend build time to the API's public `/api` URL and set `CLIENT_ORIGIN` on the API. Cross-origin cookie sessions need HTTPS and compatible cookie settings at deployment.

## Product behavior

- Without a reachable API, the public catalog falls back to clearly marked sample listings so the browsing experience can be previewed. Accounts, checkout, and seller operations require the configured API and MongoDB.
- Buyers can keep a basket as a guest. Signing in merges it into the buyer's MongoDB basket. Checkout creates a separate request for every supplier with item price snapshots.
- Orders remain `requested` with `pending_manual` payment status. BereProperty does not collect payments online; buyer and seller coordinate payment and delivery directly.
- Seller actions are scoped to the authenticated seller's store. Listing removal is a soft delete.
- Product image uploads require Cloudinary configuration; credentials stay on the API server.
- Seller terms and fees are not invented in this app. Direct sellers to BereProperty for current terms.

## Main API routes

Public: `GET /api/health`, `GET /api/categories`, `GET /api/products`, `GET /api/products/:id`, `GET /api/stores/:slug`.

Accounts: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`. Sign-in and registration are rate-limited; public registration accepts buyer and seller roles only.

Buyer: `GET/PUT /api/cart`, `POST /api/cart/merge`, `POST /api/orders`, `GET /api/account/orders`.

Seller: `GET/POST /api/seller/products`, `PATCH/DELETE /api/seller/products/:id`, `GET /api/seller/orders`, `PATCH /api/seller/orders/:id`.

Admin dashboard: `/admin` is restricted to active admin accounts. Admin: `GET /api/admin/overview`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `GET /api/admin/stores`, `PATCH /api/admin/stores/:id/moderation`, `GET /api/admin/products`, `PATCH /api/admin/products/:id/moderation`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`, `GET /api/admin/audit`. Admin changes are transactionally audited with before/after values; user accounts, stores, and listings are suspended/hidden rather than permanently deleted. Admin order acceptance uses a stock-checked transaction.

## Security and launch notes

Keep MongoDB, JWT, and Cloudinary secrets in the API host's environment. Rotate any credential that has been pasted into a public or shared chat before production. Use a dedicated MongoDB database user and restrict its access to the BereProperty catalog. Configure SPA fallback on the frontend host so direct navigation and reload work on routes such as `/products/:id`, `/seller/orders`, and `/admin/users`. Admin APIs require the admin role, active account, matching website origin for mutations, and rate limits.

The 3D-like homepage vignette is CSS and image based to keep the first-load bundle light; the layout provides an image fallback and avoids motion under reduced-motion preferences. Payment-provider integration, email verification, and production seller verification are later phases.
