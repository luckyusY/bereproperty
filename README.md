# Toolbay Marketplace

A React marketplace prototype for materials, tools and engineering supplies. It includes a responsive storefront, local demo catalog, and an Express/MongoDB API with Cloudinary-backed product images.

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the MongoDB URI and Cloudinary credentials. Keep `.env` private and on the server only.
4. Start MongoDB access for your Atlas project (allow your current IP and create a database user).
5. In one terminal run `npm run server`; in another run `npm run dev`.
6. Open the Vite URL, usually `http://localhost:5173`.

The frontend currently uses sample listings so the storefront works before the API has catalog data. API routes are available at `/api/health`, `/api/products`, and `/api/products/:id`. Create a product with `multipart/form-data` fields `name`, `description`, `category`, `price`, `unit`, `stock`, `seller[name]`, `seller[location]`, `seller[phone]`, and up to eight `images` files.

## Deployment

Deploy the React frontend as a static Vite site and deploy the API as a Node service. Configure the same environment variables on the API host, set `CLIENT_ORIGIN` to the deployed frontend origin, and use a MongoDB Atlas database user restricted to the app's required database. Never expose `CLOUDINARY_API_SECRET` or the MongoDB connection string in browser code. Rotate any credential that has been pasted into a public or shared chat.

## Plan

See [PLAN.md](./PLAN.md) for the first-release scope and follow-on phases.
