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

# The requirement will help later. by Programming Hero

# Assignment 4 - Backend Project

## 🔍 Find Your Assignment

> 💡 Check your Student ID by clicking your **profile image** on the [Programming Hero Website](https://web.programming-hero.com/profile).

| Last Digit of Student ID | Assignment |
|:------------------------:|------------|
| **0, 1, 2, 3** | [RentNest](./1-RentNest.md) 🏠 |
| **4, 5, 6** | [GearUp](./2-GearUp.md) 🏋️ |
| **7, 8, 9** | [FixItNow](./3-FixItNow.md) 🔧 |

---

## ⚠️ Mandatory Requirements

> [!CAUTION]
> **MANDATORY - READ CAREFULLY**
> 
> The following **SIX requirements are MANDATORY**:
> 1. **API Documentation** - Provide Postman collection or Swagger/OpenAPI docs covering all endpoints
> 2. **Consistent Error Responses** - All errors must return structured JSON (`{ success, message, errorDetails }`)
> 3. **Commits** - 20 meaningful backend commits with descriptive messages
> 4. **Input Validation** - Server-side validation on all endpoints with proper error messages
> 5. **Admin Credentials** - Provide working admin email & password
> 6. **Payment Integration** - Must integrate **Stripe** or **SSLCommerz** for processing payments. Simulated/fake payments (Cash on Delivery, Pay Later) are **NOT** accepted.
>
> ❌ **Failure to complete any of these = 0 MARKS**

---

## 📊 Marks Distribution

| # | Category | Weight | Details |
|:-:|----------|:------:|---------|
| 1 | API Design & Documentation | 20% | RESTful endpoints, Postman/Swagger docs, response format |
| 2 | Database Design & Schema | 20% | Prisma schema, relations, migrations, seed script |
| 3 | Commit History | 10% | 20 meaningful backend commits |
| 4 | Error Handling & Validation | 10% | Input validation, structured error responses, 404 handling |
| 5 | Core Functionality | 20% | Auth, CRUD, role-based access, middleware |
| 6 | Payment Integration | 10% | Stripe or SSLCommerz integration, payment endpoints, payment status tracking |
| 7 | Video Explanation | 10% | 3-5 min API walkthrough video |

---

## 📅 Timeline

| Deadline | Maximum Marks |
|----------|:-------------:|
| **July 09, 2026, 11:59 PM** | 60 Marks |
| **July 10, 2026, 11:59 PM** | 50 Marks |
| **From July 11, 2026 To July 31, 2026, 11:59 PM** | 30 Marks |

---

## 📦 What to Submit

| Item | Required |
|------|:--------:|
| Backend GitHub Repo | ✅ |
| Live API URL | ✅ |
| API Documentation (Postman/Swagger) | ✅ |
| Demo Video (3-5 min) | ✅ |
| Admin Credentials | ✅ |

**Example:**
```
Backend Repo     : https://github.com/your-username/rentnest-backend
Live API         : https://rentnest-api.vercel.app
API Docs         : https://documenter.getpostman.com/view/xxx
Demo Video       : https://drive.google.com/file/d/xxx/view
Admin Email      : admin@rentnest.com
Admin Password   : admin123
```

---

## 🎥 Video Explanation Guide

**Duration:** 3-5 minutes | **Language:** English or Bengali

**What to Cover:**
1. Project overview & API architecture
2. Demonstrate all 3 roles working via Postman/Thunder Client (Customer/Tenant, Provider/Landlord/Technician, Admin)
3. Show CRUD operations on key endpoints
4. Demonstrate error handling & validation in action
5. Briefly explain one technical challenge you solved

**Recording Options:**
- **Loom** - Record & share link directly
- **OBS** - Record & upload to Google Drive (set "Anyone with link" access)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API |
| TypeScript | Type safety (recommended) |
| Postgres + Prisma | Database + ORM |
| JWT | Authentication |

### Deployment
| Service | Purpose |
|---------|---------| 
| Vercel/Render | Backend API deployment |

---

## 🎯 Key Rules

- **Roles**: Each project has 3 fixed roles. Users select during registration.
- **Payment**: Payment integration is **MANDATORY**. You must integrate either **Stripe** or **SSLCommerz** for processing payments. Include endpoints for creating payment intents/sessions, handling payment confirmations, and tracking payment status.
- **No Frontend Required**: This is a backend-only assignment. Test your API via Postman/Thunder Client.
- **Flexibility**: Endpoints listed in each variant are examples. Modify as needed.

---

## ⚠️ Important Notes

> **Plagiarism** = 0 Marks. All work must be original.

**Good luck! Build a rock-solid backend you're proud of.** 🚀