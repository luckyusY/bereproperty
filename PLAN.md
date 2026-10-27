# BereProperty Marketplace — Release 1

## Product direction

Build a professional, responsive marketplace for Rwanda's construction materials, tools, and equipment. Help buyers discover local supply, compare prices and availability, contact suppliers, and send order requests. Give sellers a dedicated workspace to publish inventory and handle requests.

## Implemented experience

- Shared responsive React Router layout with a distinct homepage, catalog, category listings, product details, supplier storefronts, cart, checkout, sign-in/sign-up, buyer account, seller workspace, and information pages.
- Search, category, province and price filters, sort order, grid/list switch, pagination, local saved products, product gallery, and related listings.
- Thirteen BereProperty category routes based on the current category choices.
- Buyer/seller email and password accounts, protected account routes, guest basket persistence and merge on buyer sign-in. Admin accounts are provisioned by a one-time server command and protected by a distinct role guard.
- Seller-owned inventory CRUD, Cloudinary image upload, and seller order review/status updates. Admins can suspend accounts, verify/deactivate stores, hide/restore listings, update requested orders, and review the audit log.
- Multi-supplier checkout that creates one MongoDB order request per supplier, with price snapshots and pending/manual payment status.
- Concrete volume and bar-bending estimators, delivery partner information, about, contact, features, and current-terms pricing page.
- Green-and-amber interface, responsive navigation, reduced-motion-friendly homepage illustration, and static visual fallback.

## Data and security

MongoDB uses a dedicated `bereproperty` database in the configured Atlas cluster. A copy-and-verify command migrates the current database without deleting the source. The application does not delete unrelated databases. MongoDB, JWT, and Cloudinary secrets are server-only environment variables. Seller products and orders are scoped to the authenticated seller's store. Product deactivation is a soft delete.

Order requests are not payments. Buyers and suppliers arrange payment and delivery directly. Seller fees are not stated without current BereProperty terms.

## Run and verify

See [README.md](./README.md) for environment setup, local commands, deployment notes, and API routes. Run `npm run build` for the production bundle. Configure the frontend host's SPA fallback and the API origin/cookie policy when deploying.

## Later phases

- Payment provider integration after a payment and refund policy is selected.
- Email verification, password reset, seller verification, reviews, and moderation.
- Delivery quote integrations, notifications, and operational reporting.
