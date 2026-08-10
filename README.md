# MANIVYA Enterprises - AI-Powered Full-Stack E-Commerce Platform

MANIVYA Enterprises is a production-grade, full-stack AI-driven e-commerce platform built with modern clean architecture, responsive dark theme design, real-time location delivery detection, verified QR Code payment pipeline, and intelligent product recommendation algorithms.

---

## Technical Architecture

```
MANIVYA Enterprises/
├── client/                     # Frontend Vite + React (TypeScript) + Tailwind CSS
│   ├── src/
│   │   ├── components/         # UI Elements, Layouts, Maps, Stepper, Admin
│   │   ├── context/            # AuthContext, CartContext, LocationContext
│   │   ├── pages/              # Storefront Pages & Admin Dashboard Subpages
│   │   ├── services/           # Axios REST API Client
│   │   └── types/              # TypeScript Models
│   ├── vercel.json             # Vercel Deployment Configuration
│   └── vite.config.ts
│
└── server/                     # Backend Node.js + Express REST API
    ├── src/
    │   ├── config/             # DB Connection, Firebase Admin, Cloudinary
    │   ├── controllers/        # REST Endpoint Controllers (11 Modules)
    │   ├── middleware/         # Auth verification, Multer upload, Errors
    │   ├── models/             # Mongoose MongoDB Schemas (12 Collections)
    │   ├── routes/             # Express API Routers
    │   ├── services/           # AI Recommendation & Geolocation Engine
    │   └── utils/              # Seed Data Script & Response Formatter
    └── render.yaml             # Render Deployment Configuration
```

---

## Tech Stack & Libraries

### Frontend
- **Framework**: React.js 18 (TypeScript), Vite
- **Styling**: Tailwind CSS, Glassmorphism, Custom HSL Color Palette
- **State & Router**: React Context API, React Router DOM v6
- **Icons & Motion**: Lucide React, Framer Motion
- **Form & Notifications**: React Hook Form, React Hot Toast
- **HTTP**: Axios API Wrapper

### Backend
- **Runtime**: Node.js & Express.js (TypeScript)
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: Firebase Authentication & Firebase Admin SDK (ID Token Verification)
- **Image Storage**: Cloudinary Storage with Multer
- **Security & Logging**: Helmet, CORS, Morgan, Express Rate Limit, Bcrypt

---

## Key Features

1. **Firebase Authentication & MongoDB Sync**:
   - Google Sign-In & Email/Password authentication.
   - Automatic sync with MongoDB Atlas user collection storing `uid`, `name`, `email`, `role`, and `lastLogin`.

2. **Customer Location Detection & Dynamic Delivery**:
   - Browser geolocation permission with OpenStreetMap / Google Maps reverse geocoding into Area, City, State, and Postal Code.
   - Haversine distance calculations determining shipping fees, delivery speed, and warehouse fulfillment center selection.
   - Address book manager with map marker pin picker.

3. **Multiple Payment Gateways**:
   - **Cash on Delivery (COD)**.
   - **UPI / Bank QR Code Payment**: Display merchant QR code, upload screenshot payment proof & 12-digit UTR ID.
   - **Admin Moderation Queue**: One-click Approve or Reject payment proofs.
   - Extensible base architecture designed for future Razorpay, Stripe, and PhonePe SDK integration.

4. **AI Product Recommendation Engine**:
   - Personalization algorithms computing scores based on purchase history, wishlist, browsing tags, and frequently bought together items.

5. **Real-Time Order Delivery Tracking**:
   - Visual status stepper: `Confirmed` -> `Preparing` -> `Packed` -> `Shipped` -> `Out for Delivery` -> `Delivered`.
   - Simulated live GPS route map visualization and automated notification logs.

6. **Premium Admin Dashboard (`/admin`)**:
   - Analytics metrics: Gross revenue, today's order count, total active products, customer count, and monthly sales bar chart.
   - Full Product CRUD with multi-image Cloudinary uploader, discount calculation, stock level editor, featured/trending toggles.
   - Order status workflow, Category manager, Coupon manager, and User role manager.

---

## Quick Start Setup

### 1. Backend Setup (`/server`)

```bash
cd server
npm install
npm run seed      # Seeds admin user accounts, logistics hubs & coupons (preserves products)
npm run dev      # Starts Express server at http://localhost:5000
```

### 2. Frontend Setup (`/client`)

```bash
cd client
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

---

## Deployment Instructions

- **Frontend**: Connect `/client` directory to **Vercel**. Configure `VITE_API_BASE_URL` to point to production backend.
- **Backend**: Connect `/server` directory to **Render** using included `render.yaml`. Set environment variables for `MONGODB_URI`, `FIREBASE_*`, and `CLOUDINARY_*`.
- **Database**: Host on **MongoDB Atlas** with IP Access whitelist configured.
