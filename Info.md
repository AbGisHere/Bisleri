# Bisleri — Rural Women's Entrepreneurship Platform

A marketplace platform empowering rural women to sell local/handmade products, connect with Self Help Groups (SHGs) and NGOs, and leverage AI tools for pricing and demand prediction.

## Core Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Micromarketplace** | Buy/sell marketplace for local products |
| 2 | **Logistics** | Supply chain & delivery management |
| 3 | **SHG Skills-matching Network** | Connect women with SHGs/NGOs for training |
| 4 | **AI Pricing** | ML-based price suggestions per product |
| 5 | **Demand Prediction** | Forecast demand by region & season |

---

## Interfaces

### 1. Buyers (Users)
- Browse and purchase products from rural women sellers

### 2. Rural Women (Sellers)

**Auth Flow:**
- Enter phone number -> OTP login (no password)
- One device at a time

**Signup Details:**
- Name
- Age
- Location
- Skills

**After Auth — Two Paths:**

#### Path A: Learn & Sell
- Browse all available NGOs/SHGs
- Apply to connect with an SHG
- SHG/NGO receives a notification (person from X village wants to learn)
- Get connected to an SHG
- View upcoming SHG visits, workshop schedules
- One-point contact to assigned SHG
- AI-generated learning process timeline
- After training -> redirect to Sell Directly

#### Path B: Sell Directly
- **My Listings** — view current products
  - Order history
  - Payout/withdraw history
- **Upload New Listing**
  - Product image
  - Product name
  - Product description (AI-generated)
  - Product price (AI-suggested)
  - Product demand scale (AI)
  - Product quantity
  - Product location
- **Future:** Finance & sales dashboard

### 3. SHGs / NGOs
- Receive applications from women wanting to learn
- Manage workshops and schedules
- *(Interface not yet designed)*

---

## Implementation Status

### Done
- [x] Project scaffolding (Next.js 16, Drizzle, Better-Auth, shadcn)
- [x] Email/password auth (Better-Auth with Drizzle adapter)
- [x] Session management & protected routes
- [x] Landing page with module overview
- [x] Login / Sign-up pages
- [x] Dashboard shell (authenticated)
- [x] Dark/light theme
- [x] Custom earthy color palette & typography

### To Do — Auth & Users
- [ ] OTP-based login for rural women (phone number)
- [ ] One-device-at-a-time session enforcement
- [x] Extended user profile schema (age, location, skills, role)
- [x] Role-based routing (buyer vs seller vs SHG)

### To Do — Micromarketplace
- [ ] Product schema (image, name, description, price, quantity, location, demand)
- [ ] Product listing CRUD (create, read, update, delete)
- [ ] Product image upload & storage
- [ ] AI-generated product descriptions
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

### To Do — SHG Skills-matching Network
- [ ] SHG/NGO schema (name, location, workshops, contact)
- [ ] SHG directory (browse & search)
- [ ] Application flow (woman applies -> SHG notified)
- [ ] Workshop schedule display
- [ ] One-point SHG contact per user
- [ ] AI-generated learning timeline

### To Do — AI Pricing
- [ ] Price suggestion API endpoint
- [ ] Market trend data ingestion
- [ ] Competitor pricing analysis
- [ ] Per-product price recommendation UI

### To Do — Demand Prediction
- [ ] Demand forecasting model/API
- [ ] Regional demand heatmaps
- [ ] Seasonal trend analysis
- [ ] Demand scale indicator on product listings

### Future
- [ ] Finance & sales dashboard for sellers
- [ ] SHG/NGO admin interface
- [ ] Analytics & reporting
