# RoadAssist – Smart Roadside Assistance Platform

> **"Stranded on the Road? We've Got Your Back."**  
> A production-style, online location-based roadside breakdown assistance and emergency dispatch web application.

---

## 🌟 Project Overview

**RoadAssist** connects stranded motorists with verified nearby mechanics, jump-start technicians, fuel delivery services, and flatbed towing squads in real time. It eliminates highway vulnerability with instant dispatch, upfront pricing, live GPS telemetry, and emergency hotlines.

Designed and engineered as a high-performance web platform for college mini-projects and startup prototypes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Leaflet, Sonner, Recharts |
| **Backend** | Node.js, Express.js, Socket.IO, Helmet, Morgan, Express Rate Limit, Multer |
| **Database** | MySQL / MariaDB (Parameterized queries via `mysql2/promise`) |
| **Authentication**| JWT (JSON Web Tokens), bcryptjs password hashing, Role-Based Access Control (RBAC) |
| **Maps & Location**| Leaflet, OpenStreetMap, Browser Geolocation API, Haversine Distance Formula |

> **Strictly Online Architecture:** RoadAssist is 100% online-based. No offline service workers, no PWA caching, and no IndexedDB offline modes. All data transactions and tracking streams occur live.

---

## 👥 Three Comprehensive Role Modules

### 1. 🚗 Customer Module
- **Startup Landing Page**: Hero section with quick breakdown trigger, 6 service categories, 4-step workflow, customer reviews, interactive FAQ, and 24/7 helpline footer.
- **Breakdown Reporting**: Form supporting 7 problem categories (Flat Tyre, Battery Failure, Fuel Shortage, Engine Failure, Overheating, Accident, Other Mechanical Issues) with vehicle selection, photo upload, and live GPS auto-detect.
- **Smart Breakdown Suggestions**: Rule-based intelligence card displaying immediate safety precautions, fix duration, and indicative cost ranges.
- **Find Assistance Interactive Map**: Full Leaflet OpenStreetMap view with custom vehicle & mechanic markers, radius filter, and smart provider ranking.
- **Live 5-Stage Tracking**:
  1. *Request Submitted*
  2. *Provider Accepted*
  3. *Provider On The Way*
  4. *Assistance In Progress*
  5. *Service Completed*
  Powered by **Socket.IO** rooms with live GPS route visualization and technician calling.
- **Vehicle Garage**: Save, edit, and manage vehicles (Make, Model, Year, Registration Plate, Type) with default vehicle selection.
- **Feedback & Rating**: Post-service 5-star rating and comment submission with real-time aggregate recalculation.
- **Emergency SOS Center**: 1-click coordinates copy, OpenStreetMap link, direct speed dial to 112, 100, 108, 1033, and personal emergency contacts.

---

### 2. 🔧 Service Provider Module
- **Provider Registration & Portal**: Business name, owner info, address, coordinates, base charges, per-km fees, and operating hours.
- **Provider Dashboard**: Real-time KPI metrics (Total requests, Pending approvals, Active en-route, Completed jobs, Total revenue).
- **Online / Offline Toggle**: Live availability switch to receive or pause customer dispatch requests.
- **Live Service Queue**: Accept, decline, and advance job statuses (*Accepted &rarr; On The Way &rarr; In Progress &rarr; Completed*).
- **Final Invoicing**: Set final service charges upon repair completion.
- **Customer Feedback**: View ratings, star distributions, and customer testimonials.
- **Verification Guard**: Only administratively verified providers appear in customer searches.

---

### 3. 🛡️ Administrator Operations Module
- **Executive Analytics Hub**:
  - Daily incident volume & resolution trends (**Recharts AreaChart**)
  - Breakdown categories distribution (**Recharts BarChart**)
  - Real-time KPI counters (Registered drivers, verified partners, pending approvals, total revenue)
- **Provider Verification & Compliance**: Review workshop credentials, approve (verify) providers, or reject applications with custom feedback reasons.
- **User Account Management**: Search and filter customers, providers, and admins with 1-click account suspension / reactivation.
- **Platform Incident Telemetry**: Monitor all ongoing and past requests across India with filter by status and category.
- **Review Moderation**: Audit all customer feedback.

---

## ⚡ Smart Features

1. **Smart Breakdown Suggestions**:
   - Rule-based diagnostic intelligence that dynamically updates based on the selected breakdown category.
   - Provides immediate driver safety checklists (hazard lights, shoulder positioning, overheating precautions) and indicative fix durations.
2. **Smart Provider Matching**:
   - Computes real-time Haversine great-circle distance between driver coordinates and garage locations.
   - Ranks providers using a weighted composite score:
     $$\text{Score} = (\text{Rating} \times 0.4) + (\text{Proximity} \times 0.4) + (\text{Experience} \times 0.2)$$
   - Automatically tags providers: *"Nearest Rescue"*, *"Top Rated"*, or *"Best Value"*.
3. **Upfront Estimated Service Pricing**:
   - Computes transparent pricing before dispatch:
     $$\text{Estimated Cost} = \text{Base Charge} + (\text{Distance (km)} \times \text{Per-Km Rate})$$
4. **Emergency SOS Assistance Mode**:
   - Dedicated modal with high-contrast emergency theme.
   - Copies exact latitude/longitude and OpenStreetMap link to clipboard for instant WhatsApp/SMS sharing.
   - One-touch phone dialers for National Helpline 112, Police 100, Ambulance 108, and NHAI Highway SOS 1033.

---

## 🗄️ Database Design

Normalized MySQL schema located in `database/schema.sql`:

1. `users`: Stores authentication, contact details, role (`customer`, `provider`, `admin`), status (`active`, `suspended`), emergency contacts.
2. `vehicles`: Saved user vehicles with make, model, year, registration plate, vehicle type, default flag.
3. `providers`: Business profile, coordinates (Lat/Lng), services JSON array, operating hours, base & per-km charges, verification status (`pending`, `verified`, `rejected`), rating, total completed services, total earnings.
4. `services`: Standard service catalog with category, base price, estimated duration, and icon name.
5. `assistance_requests`: Unique `request_code` (e.g. `REQ-8392`), foreign keys to user, provider, and vehicle, category, coordinates, address, status pipeline, estimated cost, final cost, payment status.
6. `request_updates`: Audit log for tracking timeline changes with timestamps and user references.
7. `reviews`: 1-5 star ratings and reviews linked to request, customer, and provider.
8. `provider_availability`: Real-time online flag and GPS location pings.
9. `notifications`: In-app user alerts with unread counter.

---

## 🔑 Pre-Seeded Demo Credentials

For quick evaluation and testing without registering from scratch:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `rahul@gmail.com` | `Password@123` | Has 2 saved vehicles, 1 active request, past service history |
| **Customer 2**| `priya@gmail.com` | `Password@123` | Has 1 saved vehicle |
| **Provider** | `quickfix@roadassist.com`| `Password@123` | QuickFix Auto Rescue (Verified, 4.9⭐, Madhapur) |
| **Provider** | `apex@roadassist.com` | `Password@123` | Apex 24x7 Roadside & Towing (Verified, 4.8⭐, Gachibowli) |
| **Provider** | `metro@roadassist.com`| `Password@123` | Metro Road Doctors (**Pending Approval** for Admin demo) |
| **Admin** | `admin@roadassist.com` | `Password@123` | Platform Administrator with full access to analytics |

> **Tip:** On the Login page (`/login`), click the **"Customer"**, **"Provider"**, or **"Admin"** buttons in the *One-Click Demo Credentials* box to automatically fill the credentials!

---

## 🚀 Running the Project

### 1. Database Initialization
```bash
# Start MySQL and import schema and seed data:
mysql -u roadassist -proadassist123 -P 3307 -h 127.0.0.1 < database/schema.sql
mysql -u roadassist -proadassist123 -P 3307 -h 127.0.0.1 < database/seed.sql
```

### 2. Backend Server
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5001
# Socket.IO active on port 5001
```

### 3. Frontend Client
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔒 Cybersecurity & Engineering Highlights

- **SQL Injection Prevention**: 100% parameterized SQL prepared statements via `mysql2/promise`.
- **Password Security**: Strong salting and hashing with `bcryptjs` (cost factor 10).
- **Authentication**: Stateless JSON Web Tokens (JWT) signed with secure server secrets and expiry.
- **Role-Based Guards**: Strict Express middlewares ensuring only authorized roles access customer, provider, or admin APIs.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login and API flooding (500 requests / 15 minutes).
- **HTTP Security**: `helmet` security headers configured with cross-origin resource policy.
- **Secure File Uploads**: `multer` checks file mime types (JPEG, PNG, WebP) and enforces 5MB file size limits.
