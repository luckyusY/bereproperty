Project Plan — Toolbay Marketplace

1. Product direction
Create a responsive marketplace for finding construction materials, tools, equipment, and engineering supplies in Rwanda. Prioritize quick search, useful categories, clear prices in RWF, seller trust, availability, and location.

2. Site map confirmed from the live site
- Marketplace home and 13 category routes, including real supplier cards, RWF price/unit, stock state, seller, and Rwanda location. Browse controls include curated/trending/hot-new, grid/list, sort, categories, and filters.
- Product detail route: seller/store link, description, price/unit, stock, contact/call/chat, quantity, cart, buy now, sharing, refund status, review ratings, and recommendations.
- Seller storefront route: store identity and a product catalog.
- Cart and sign-in/sign-up; sign-up branches into buyer and seller registration. Seller setup asks for store and business info, location, currency, contact, and payout method.
- Construction calculators: concrete-volume estimator and bar-bending/stirrup-spacing schedule.
- Delivery partners, About, Contact, Features, and Pricing pages, plus the install-app prompt.

Live review note (26 Oct 2026): inspected the home page, all category paths and informational/auth/cart/calculator routes exposed in its navigation, a sample of live product details, and seller storefront links. The live About page loaded only a placeholder, and Features/Pricing displayed “page” placeholders. Several direct product/store loads stayed on a loading shell, while fully loaded detail pages confirmed the flow above. Delivery partners described choosing a provider at checkout or having the seller choose during payment verification. Contact page lists +250 788 474 297, support@toolbay.net, and Kigali, Rwanda.

3. First release scope
- Responsive marketplace with all live category choices, search, discovery tabs, listing cards, sort/filter controls, grid/list affordance, and realistic RWF demo catalog.
- Route pages for product details, seller stores, cart, buyer/seller account entry, calculators, contact, delivery information, and informational pages.
- Product/seller browsing, local basket persistence, and clear disabled/demo messaging where a real service is not connected.
- MongoDB-backed product API and Cloudinary image upload path, configured only on the server.

4. Build approach
Use React + Vite, Express, Mongoose, MongoDB Atlas, and Cloudinary. Keep credentials in server-side environment variables. Keep the demo catalog clearly distinct from live API data until the client is connected to the API. Implement accessible controls and responsive layouts.

5. Later phases
- Connect front-end listings to the API and implement full inventory editing and seller onboarding.
- Accounts, verified business profiles, seller dashboards, reviews, and moderation.
- Rwanda-specific delivery/pickup and quote workflows, then payment verification and messaging.
- Admin tools, analytics, production email/SMS, and customer support flows.

6. Acceptance checks
- Marketplace and secondary routes load at desktop and mobile widths.
- Search, categories, sort, saved state, cart, product details, and calculator forms respond.
- RWF price/unit, seller/location, and availability are easy to scan.
- Real checkout, account creation, calls/chat, and seller operations remain unconnected until implemented with secure services.
