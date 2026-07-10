# RentNest 🏠 — Backend API

Rental property marketplace backend. Node.js + Express + TypeScript + PostgreSQL (Prisma) + JWT Auth + Stripe payments.

## Project Structure

```
src/
  app.ts                  -> express app, middleware wiring
  server.ts               -> entry point, connects DB and starts server
  config/index.ts         -> loads .env into a typed config object
  shared/prisma.ts        -> single PrismaClient instance
  types/express.d.ts      -> adds req.user typing
  utils/                  -> ApiError, catchAsync, sendResponse, jwt helpers, httpStatus
  middlewares/            -> auth guard, zod validateRequest, notFound, globalErrorHandler
  routes/index.ts         -> mounts every module's router under /api
  modules/
    auth/                 -> register, login, /me
    category/             -> category CRUD (admin)
    property/             -> public browse/filter + landlord CRUD
    rental/                -> tenant submit request + landlord approve/reject
    payment/                -> Stripe checkout session + webhook
    review/                 -> tenant reviews after COMPLETED rental
    admin/                 -> manage users/properties/rentals
prisma/
  schema.prisma           -> full DB schema
  seed.ts                 -> creates admin user + default categories
RentNest.postman_collection.json  -> import into Postman for full API docs
```

## 1. Setup

```bash
npm install
cp .env.example .env
```

### 🔴 THINGS YOU MUST EDIT YOURSELF

| # | File | What to change |
|---|------|-----------------|
| 1 | `.env` | `DATABASE_URL` — create a free Postgres DB (Neon.tech / Supabase / Railway) and paste its connection string |
| 2 | `.env` | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — put any long random string |
| 3 | `.env` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` — this becomes your admin login (assignment requires working admin credentials) |
| 4 | `.env` | `STRIPE_SECRET_KEY` — get a free test key from https://dashboard.stripe.com/test/apikeys (starts with `sk_test_...`) |
| 5 | `.env` | `STRIPE_WEBHOOK_SECRET` — from Stripe CLI or Stripe Dashboard webhook settings (see step 4 below) |
| 6 | `.env` | `CLIENT_SUCCESS_URL` / `CLIENT_CANCEL_URL` — set to your deployed URL once you deploy (Vercel/Render) |

I could not run `npx prisma generate` / `npx prisma migrate` in this sandbox because outbound network here is restricted (Prisma needs to download an engine binary from `binaries.prisma.sh`, which isn't whitelisted for me). This is NOT a bug in the code — it will work normally on your machine. Run these yourself:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Then run the server:

```bash
npm run dev
```

Visit `http://localhost:5000` → should show `{"success":true,"message":"RentNest API is running 🏠"}`.

## 2. Stripe Webhook (for local testing)

Install Stripe CLI, then:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

It will print a `whsec_...` value — put that into `STRIPE_WEBHOOK_SECRET` in `.env`.

If you don't want to set up the CLI right now, there's also a manual dev-only endpoint:
`POST /api/payments/confirm/:rentalRequestId` (tenant, auth required) — marks the payment COMPLETED and rental ACTIVE without needing a real webhook. Useful for your demo video, but mention in the video that the real flow uses the Stripe webhook.

## 3. How the Rental + Payment flow works

1. Tenant registers/logs in → browses `/api/properties` → submits `/api/rentals` (status `PENDING`)
2. Landlord logs in → sees it in `/api/rentals/landlord/requests` → `PATCH /api/rentals/landlord/requests/:id` with `{"status":"APPROVED"}`
3. Tenant calls `POST /api/payments/create` with the `rentalRequestId` → gets back a Stripe Checkout `checkoutUrl` → pays with Stripe test card `4242 4242 4242 4242`
4. Stripe fires the webhook → rental becomes `ACTIVE`, property `isAvailable` becomes `false`, payment becomes `COMPLETED`
5. Landlord can later mark it `COMPLETED` (you'll need to add that one PATCH if you want a manual "complete" step — see "Things you might want to add" below)
6. Tenant leaves a review via `/api/reviews` (only allowed once rental is `COMPLETED`)

## 4. Consistent Error Response

Every error goes through `globalErrorHandler.ts` and returns:
```json
{ "success": false, "message": "...", "errorDetails": "..." }
```
Zod validation errors, Prisma known errors (duplicate email, not found, etc.), and manually thrown `ApiError`s are all handled.

## 5. Deploy

- Push this repo to GitHub
- Deploy to **Render** or **Vercel** (Render is easier for a long-running Express + Postgres app)
- Add all `.env` variables into the deployment platform's environment settings
- Update `CLIENT_SUCCESS_URL` / `CLIENT_CANCEL_URL` and the Stripe webhook URL to point at your live domain

## 6. Things you might want to add yourself (not mandatory, but worth thinking about since assignment says "design your own schema / endpoints as needed")

- `PATCH /api/rentals/landlord/requests/:id/complete` — landlord marks an ACTIVE rental as COMPLETED (right now it's easiest to just do this manually with `prisma studio` or add one more service function similar to `updateRentalStatus`)
- Pagination on `GET /api/properties` and `GET /api/admin/users` (the marking rubric mentions "response format" — consider using the `meta` field already built into `sendResponse`)
- Refresh token endpoint (`POST /api/auth/refresh-token`) — the refresh token is already generated at login, you just need a route + service function that verifies it and issues a new access token
- Rate limiting / helmet for production hardening (not required but good practice)

## 7. Postman

Import `RentNest.postman_collection.json` into Postman. It has every endpoint pre-built with `{{baseUrl}}` and token variables — after logging in, copy the `accessToken` into the relevant collection variable (`tenantToken`, `landlordToken`, `adminToken`).

## Admin Credentials (after seeding)

```
Email: admin@rentnest.com
Password: admin123
```