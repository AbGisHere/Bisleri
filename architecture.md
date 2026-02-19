# Bisleri - System Architecture

Rural women entrepreneurship marketplace. Sell local products, connect with
self-help groups (SHGs), discover nearby clusters of artisans/producers.

## High-Level Architecture

```
+------------------+       +------------------+       +------------------+
|                  |       |                  |       |                  |
|   Next.js Web    | <---> |   API Routes     | <---> |   PostgreSQL     |
|   (React 19)     |       |   (Next.js)      |       |   (Drizzle ORM)  |
|                  |       |                  |       |                  |
+------------------+       +------------------+       +------------------+
        |                          |
        |                          |
        v                          v
+------------------+       +------------------+
|                  |       |                  |
|  Better-Auth     |       |  Object Storage  |
|  (sessions,      |       |  (product imgs)  |
|   email+pw)      |       |                  |
+------------------+       +------------------+
```

## Monorepo Layout

```
bisleri/
  apps/
    web/              Next.js 16 app (port 3001)
  packages/
    auth/             Better-Auth config + Drizzle adapter
    db/               Drizzle schema, migrations, docker-compose
    config/           Shared tsconfig
    env/              Typed env vars (t3-oss/env)
```

## Tech Stack

| Layer          | Choice                  | Why                                      |
|----------------|-------------------------|------------------------------------------|
| Frontend       | Next.js 16 + React 19   | SSR for SEO, server components for speed |
| Styling        | Tailwind CSS 4 + shadcn | Fast to build, accessible components     |
| Auth           | Better-Auth             | Email/password now, OTP/social later     |
| Database       | PostgreSQL + Drizzle    | Relational data, type-safe queries       |
| Validation     | Zod                     | Shared schemas between client and server |
| Forms          | TanStack React Form     | Type-safe, works with Zod                |
| Package Mgr    | Bun                     | Fast installs, native workspace support  |
| Containerized  | Docker (Postgres)       | One command local DB setup               |

## Key Features Mapped to Routes

```
/                       Landing page - featured products, cluster map
/products               Browse/search products by category, location
/products/[id]          Product detail page
/sell                   Seller dashboard - list products, view orders
/sell/new               Create new product listing
/shg                    SHG directory - search by district/state
/shg/[id]              SHG detail + contact info
/clusters               Map view of artisan clusters
/clusters/[id]          Cluster detail - products + SHGs in area
/login                  Sign in / sign up (already built)
/dashboard              User dashboard (already built)
```

## Cluster Mapping

Store lat/lng per cluster, render on a map.

```
Browser
  |
  v
Leaflet.js (open-source, no API key needed)
  |
  v
/api/clusters -> SELECT * FROM cluster -> GeoJSON response
  |
  v
Markers on India map, click to see cluster details
```

No paid map APIs. Leaflet + OpenStreetMap tiles = free.

## Auth Flow (already working)

```
Client                    Server                    DB
  |                         |                        |
  |-- signUp(email, pw) --> |                        |
  |                         |-- INSERT user -------> |
  |                         |-- INSERT session -----> |
  |  <-- cookie (session) --|                        |
  |                         |                        |
  |-- getSession() -------> |                        |
  |                         |-- SELECT session -----> |
  |  <-- user data ---------|                        |
```

## API Design

All API routes live in `apps/web/src/app/api/`. Next.js route handlers.

```
GET  /api/products              list products (filter by category, location)
POST /api/products              create product (seller only)
GET  /api/products/[id]         get product
GET  /api/clusters              list clusters (optional: lat/lng bounds)
GET  /api/clusters/[id]         get cluster with products + SHGs
GET  /api/shg                   list SHGs (filter by district, state)
GET  /api/shg/[id]              get SHG detail
POST /api/orders                place order
GET  /api/orders                list orders (buyer or seller)
GET  /api/auth/[...all]         better-auth handles this (already built)
```

## Deployment

Vercel (Next.js app)  +  Neon/Supabase (managed Postgres)
