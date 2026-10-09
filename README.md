# 🍽️ Saveur - Full Stack Restaurant Mobile App (Assignment 2)

A full-stack mobile application and REST API server built with **React Native (Expo)**, **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Repository Structure

```
d:\expo-app\
├── A2/                             # Assignment 2 Deliverables
│   ├── SRS_v2.md                   # Updated SRS Document
│   └── restaurant-api.postman_collection.json # Postman Collection
├── server/                         # Node.js + Express + MongoDB Backend
│   ├── config/                     # Database connection configuration (db.js)
│   ├── controllers/                # Auth, Menu, Order, Reservation controllers
│   ├── middleware/                 # JWT Auth & Manager authorization middleware
│   ├── models/                     # Mongoose Schemas (User, MenuItem, Table, Order, Reservation)
│   ├── routes/                     # REST API Routes
│   ├── .env.example                # Environment variables template
│   ├── seed.js                     # Database Seeder Script
│   └── server.js                   # Main Express Server entrypoint
├── src/                            # React Native App Code
│   ├── api/                        # Centralized API client (client.js)
│   ├── components/                 # Reusable UI components
│   ├── context/                    # Auth, Theme, Cart, Menu Contexts
│   ├── hooks/                      # Custom hooks (useApi, useForm, useDebounce)
│   └── screens/                    # Mobile Screens (Login, Menu, Cart, Tracking, Dashboard, etc.)
├── App.js                          # Main React Native Root
├── package.json                    # Expo Frontend package manifest
└── README.md                       # Documentation
```

---

## 🚀 How to Run the Backend Server

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside `server/` (or copy `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/restaurant_app
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
   *(For MongoDB Atlas, replace `MONGO_URI` with your connection string).*

4. **Seed Initial Database Data:**
   Populates 16 menu items, 6 tables, and 2 default users:
   ```bash
   npm run seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000` (or `http://<YOUR_IP>:5000`).

---

## 📱 How to Run the Mobile App

1. **Set `BASE_URL` in `src/api/client.js`:**
   Open [src/api/client.js](file:///d:/expo-app/src/api/client.js) and update the IP to your laptop's local network IP address:
   ```javascript
   export const BASE_URL = 'http://192.168.1.15:5000'; // Replace with your laptop's LAN IP
   ```
   - For Web Browser testing: `http://localhost:5000`
   - For Android Emulator: `http://10.0.2.2:5000`
   - For physical device on Wi-Fi: `http://<YOUR_LAPTOP_IP>:5000`

2. **Start the Expo Frontend:**
   ```bash
   npx expo start --web
   ```

---

## 🔑 Seeded Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `Customer1` |
| **Manager** | `manager@demo.com` | `Manager1` |

---

## 🌐 API Endpoint Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health status check |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | User login & JWT issuance |
| `GET` | `/api/menu` | Public | List menu items (supports `?category=` and `?search=`) |
| `GET` | `/api/menu/:id` | Public | Get menu item by ID |
| `POST` | `/api/menu` | Manager | Add new menu item |
| `PUT` | `/api/menu/:id` | Manager | Edit menu item price or availability |
| `DELETE` | `/api/menu/:id` | Manager | Delete menu item |
| `POST` | `/api/orders` | Customer | Place order (total calculated on server) |
| `GET` | `/api/orders/my` | Customer | Fetch logged-in user's orders |
| `GET` | `/api/orders` | Manager | Fetch all restaurant orders |
| `PATCH` | `/api/orders/:id/status` | Manager | Update order status (Pending → Preparing → Ready → Served) |
| `POST` | `/api/reservations` | Customer | Book table reservation (conflict & capacity checked) |
| `GET` | `/api/reservations/my` | Customer | Fetch customer's reservations |
| `GET` | `/api/reservations` | Manager | Fetch all restaurant reservations |
| `PATCH` | `/api/reservations/:id` | Manager | Confirm, decline, or cancel reservation |
