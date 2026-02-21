# Rangaayan — Rural Women's Entrepreneurship Platform

A marketplace platform empowering rural women to sell local/handmade products, connect with Self Help Groups (SHGs) and NGOs, and leverage AI tools for pricing and demand prediction.

## Core Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Micromarketplace** | Buy/sell marketplace for local products |
| 2 | **Logistics** | Supply chain & delivery management |
| 3 | **SHG Skills-matching Network** | Connect women with SHGs/NGOs for training |
| 4 | **AI Pricing** | LLM-based price suggestions per product |
| 5 | **Demand Prediction** | Forecast demand by region & season |

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Auth:** Better-Auth with Drizzle adapter (email/password)
- **Database:** PostgreSQL via Drizzle ORM
- **AI Backend:** FastAPI (Python) with Kimi K2.5 via OpenRouter
- **AI Detection:** Kimi K2.5 vision (replaced YOLO — no torch/ultralytics dependency)

---

## Interfaces

### 1. Buyers (Users)
- Browse and purchase products from rural women sellers
- Browse NGOs and enroll in workshops

### 2. Rural Women (Sellers)

**Auth Flow:**
- Email/password signup → onboarding (name, age, location, skills)
- Role-based routing to seller dashboard

**After Auth — Two Paths:**

#### Path A: Learn & Sell
- Browse all available NGOs/SHGs (`/seller/ngos`)
- View NGO details, upcoming workshops, skill programs
- Enroll/unenroll in workshops (capacity-checked)
- After training → redirect to Sell Directly

#### Path B: Sell Directly
- **Marketplace** — view/manage listings, orders
- **AI Pricing** — get LLM-powered price suggestions (`/seller/ai-pricing`)
- **Demand Insights** — analyze demand with AI (`/seller/demand-insights`)
- **Quick Demand Check** — inline widget on seller dashboard
- **Upload New Listing** — product image → AI detection + description + pricing

### 3. SHGs / NGOs

**Auth Flow:**
- Email/password signup → onboarding with NGO-specific fields (NGO name, focus areas, district coverage, women served)

**Dashboard (`/ngo/dashboard`):**
- **Manage Workshops** — create workshops (title, skill area, date, location, capacity), view enrolled sellers, delete
- **Manage Skill Programs** — create programs (title, skills, duration), delete
- **Connect Women** — view all enrolled sellers across workshops
- **Resource Library** — government schemes, templates, training guides

---

## AI Endpoints (FastAPI)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/detect/` | POST | Product detection from image (Kimi K2.5 vision) |
| `/api/detect/categories` | GET | List 20 product categories |
| `/api/describe/` | POST | Generate 1-sentence product description |
| `/api/demand/` | POST | Demand analysis (JSON) |
| `/api/demand/stream` | POST | Demand analysis (SSE streaming) |
| `/api/pricing/` | POST | Smart pricing suggestion (JSON) |
| `/api/pricing/stream` | POST | Smart pricing (SSE streaming) |
| `/api/competitors/` | POST | Competitor price data aggregation |

All LLM endpoints use **Kimi K2.5** (`moonshotai/kimi-k2.5`) via OpenRouter. Demand and pricing endpoints use tool-calling (web search, competitor prices, seasonal data). Detection uses vision (base64 image).

---

## Database Schema

**Core Tables:**
- `user` — id, name, email, role (`seller`|`buyer`|`ngo`), age, location, skills, interests, shgName, memberCount, focusArea, districtCoverage, onboardingComplete
- `workshop` — id, ngoId (FK), title, description, skillArea, scheduledAt, location, maxAttendees, status (`upcoming`|`completed`|`cancelled`)
- `enrollment` — id, userId (FK), workshopId (FK), unique(userId, workshopId)
- `program` — id, ngoId (FK), title, description, skills, durationWeeks, status (`active`|`upcoming`|`completed`)
- `session`, `account`, `verification` — Better-Auth tables

---

## Implementation Status

### Done — Infrastructure
- [x] Project scaffolding (Next.js 16, Drizzle, Better-Auth, shadcn)
- [x] Email/password auth (Better-Auth with Drizzle adapter)
- [x] Session management & protected routes
- [x] Landing page with module overview
- [x] Login / Sign-up pages
- [x] Dashboard shell (authenticated, role-based)
- [x] Dark/light theme with earthy color palette & typography
- [x] Extended user profile schema (age, location, skills, role, NGO fields)
- [x] Role-based routing (buyer vs seller vs ngo)
- [x] Onboarding flow with role selection and role-specific fields
- [x] Auth client type inference for all user fields (including NGO fields)

### Done — AI Backend
- [x] FastAPI service with 5 routers (detect, describe, pricing, demand, competitors)
- [x] OpenRouter LLM client with tool-calling loop + SSE streaming
- [x] Product detection via Kimi K2.5 vision (replaced YOLO/torch)
- [x] AI product description generation (direct LLM, no tools)
- [x] AI pricing with tool-calling (web search, competitor prices, margin calc)
- [x] AI demand insights with tool-calling (web search, seasonal trends)
- [x] Competitor price scraping (DuckDuckGo + marketplace extraction)
- [x] Next.js API proxy routes for all AI endpoints

### Done — Seller Features
- [x] Seller dashboard with workspace cards
- [x] Quick Demand Check widget (inline on dashboard)
- [x] AI Pricing page (`/seller/ai-pricing`) — redesigned single-column layout
- [x] Demand Insights page (`/seller/demand-insights`) — redesigned single-column layout
- [x] Browse NGOs (`/seller/ngos`) — list with search/filter
- [x] NGO detail page (`/seller/ngos/[id]`) — view workshops, programs, enroll
- [x] Workshop enrollment (enroll/unenroll with capacity check)
- [x] Logistics page shell (`/seller/logistics`)

### Done — NGO Features
- [x] NGO onboarding (name, focus areas, district coverage, women served)
- [x] NGO dashboard with stats
- [x] Workshop management (create, view enrollees, delete)
- [x] Skill program management (create, delete)
- [x] Connect Women page (view enrolled sellers per workshop)
- [x] Resource Library (government schemes, templates, guides)

### Done — Buyer Features
- [x] Buyer dashboard
- [x] Browse NGOs (`/buyer/ngos`)
- [x] NGO detail page (`/buyer/ngos/[id]`) — view workshops, enroll
- [x] Cart with item count in header

### To Do — Auth & Users
- [ ] OTP-based login for rural women (phone number)
- [ ] One-device-at-a-time session enforcement

### To Do — Micromarketplace
- [ ] Product schema (image, name, description, price, quantity, location, demand)
- [ ] Product listing CRUD (create, read, update, delete)
- [ ] Product image upload & storage
- [ ] Buyer-facing product browse & search
- [ ] Shopping cart & checkout flow
- [ ] Order management (seller side)
- [ ] Order history (buyer side)
- [ ] Payout/withdraw history (seller side)

### To Do — Logistics
- [ ] Shipping & delivery tracking schema
- [ ] Order-to-delivery pipeline
- [ ] Delivery status updates
- [ ] Returns management

### To Do — SHG Network Enhancements
- [ ] Workshop/program edit endpoints (only create & delete exist)
- [ ] Workshop status updates (upcoming → completed)
- [ ] NGO profile editing (post-onboarding)
- [ ] Notification system (woman applies → NGO notified)
- [ ] AI-generated learning timeline

### To Do — AI Enhancements
- [ ] Regional demand heatmaps
- [ ] Demand scale indicator on product listings
- [ ] AI description auto-fill during product upload

### Future
- [ ] Finance & sales dashboard for sellers
- [ ] Analytics & reporting
- [ ] Enrollee export/reporting for NGOs
