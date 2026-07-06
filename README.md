# 🛒 ShopSphere - MERN E-Commerce Website

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

<p align="center">
A modern Full Stack MERN E-Commerce platform built with React, Node.js, Express, and MongoDB featuring secure authentication, admin dashboard, product management, shopping cart, wishlist, and order management.
</p>

---

# ✨ Features

## 👤 User Features

- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Profile Management
- Product Search
- Product Filters
- Product Categories
- Product Details
- Wishlist
- Shopping Cart
- Checkout
- Order History
- Order Tracking
- Responsive Design

---

## 🛍 Product Features

- Product Listing
- Product Details
- Product Categories
- Product Images
- Brand Information
- Ratings & Reviews
- Search Suggestions
- Price Filters
- Availability Filters
- Sorting Options
- Pagination

---

## 🛒 Shopping Cart

- Add to Cart
- Remove Product
- Increase Quantity
- Decrease Quantity
- Coupon Support
- Order Summary
- Checkout Flow

---

## 🔐 Authentication

- Register
- Login
- Logout
- Password Encryption (bcrypt)
- JWT Tokens
- Protected Routes
- Role-Based Access Control

---

## 👨‍💼 Admin Dashboard

- Dashboard Analytics
- Manage Products
- Add Products
- Update Products
- Delete Products
- Manage Categories
- Manage Orders
- Manage Users
- Sales Analytics
- Revenue Dashboard

---

# 🚀 Tech Stack

### Frontend

- React.js (Vite)
- React Router DOM
- Tailwind CSS
- Axios
- React Icons
- Framer Motion
- Chart.js

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- JWT
- bcrypt

### File Upload

- Multer

### Deployment

- Vercel
- Render

---

# 📂 Project Structure

```
ShopSphere/

├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── .env
│
├── README.md
└── package.json
```

---


## Frontend

```bash
cd client

npm install

npm run dev
```

## Backend

```bash
cd server

npm install

npm run dev
```

---

# ⚙ Environment Variables

Create a **.env** file inside the server folder.

```
PORT=5000

MONGO_URI=Your MongoDB URI

JWT_SECRET=Your Secret Key
```

---



# 📈 Future Improvements

- Online Payments (Stripe/Razorpay)
- Email Notifications
- Product Reviews
- Live Chat Support
- Multi-Vendor Support
- AI Product Recommendations
- Coupons & Discounts
- Invoice Generation

---

# 📚 Learning Outcomes

- Full Stack MERN Development
- REST API Development
- JWT Authentication
- MongoDB Database Design
- CRUD Operations
- Role-Based Authorization
- Responsive UI Design
- Deployment on Vercel & Render

---

# 🌐 Deployment

Frontend: **Vercel**

Backend: **Render**

Database: **MongoDB Atlas**

---

# 👨‍💻 Author

**M Leela Sai Aditya**

---

⭐ If you like this project, don't forget to star the repository!

# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.
