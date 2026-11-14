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
