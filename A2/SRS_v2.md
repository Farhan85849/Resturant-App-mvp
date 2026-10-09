# Software Requirements Specification (SRS v2.0)
## Saveur Restaurant Mobile Application & Backend System

---

### 1. Introduction & Scope (Section 1.2 Updated)

#### 1.2 System Scope
Saveur is a full-stack mobile restaurant platform consisting of a React Native mobile application and a centralized Node.js/Express server backed by MongoDB.

**In Scope:**
* User registration and authentication with bcrypt password hashing and JSON Web Tokens (JWT).
* Role-based access control (Customer vs. Restaurant Manager).
* Centralized dynamic menu management (CRUD operations by managers; real-time menu browsing, filtering, and search by customers).
* Multi-device synchronized order management (server-calculated totals, availability checks, state machine status transitions: Pending → Preparing → Ready → Served / Cancelled).
* Table reservation system with automated capacity checking and double-booking conflict detection.
* Periodic status polling (every 10s) on customer order tracking screen to reflect manager updates instantly across devices.

**Out of Scope:**
* Third-party payment gateway integration (Stripe/PayPal).
* Push notifications (APNs / FCM).

**Data Inconsistency & Synchronization Problems Solved from A1:**
1. *Price Desynchronization:* In A1, when a manager updated a dish price on one phone, other phones retained stale local prices. **Fixed:** All menu data is now queried from a single MongoDB source.
2. *Order Loss on Reinstall:* In A1, orders were stored in local memory/AsyncStorage and lost upon application reinstall or device switch. **Fixed:** Orders are stored in the database and fetched via `GET /api/orders/my`.
3. *Unavailable Dish Ordering:* In A1, a customer could order an item after a manager marked it out of stock on another device. **Fixed:** The server validates item availability during `POST /api/orders` and rejects unavailable items.
4. *Reservation Conflicts:* In A1, two customers could book the same table at the same time. **Fixed:** Server queries database for existing confirmed/pending bookings at the same date, time, and table ID, returning HTTP 409 on conflict.

---

### 2. Definitions & Acronyms (Section 1.3 Updated)

1. **API (Application Programming Interface):** A set of defined rules and endpoints that enable the mobile client to communicate with the server.
2. **REST (Representational State Transfer):** An architectural style for network applications using standard HTTP methods (GET, POST, PUT, PATCH, DELETE).
3. **Endpoint:** A specific URI (e.g., `/api/menu`) where the API receives requests.
4. **JSON (JavaScript Object Notation):** Lightweight data-interchange format used for client-server communication.
5. **MongoDB:** A NoSQL document-oriented database that stores data in flexible BSON collections.
6. **Collection:** A grouping of MongoDB documents (equivalent to a relational database table).
7. **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
8. **Middleware:** Functions that execute during the request-response lifecycle (e.g., authentication check).
9. **JWT (JSON Web Token):** A compact token format used to securely transmit user authentication claims between client and server.
10. **HTTP Status Code:** Standard numerical response codes indicating request outcomes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error).

---

### 3. Database Design (Replaces Section 5)

| Collection | Fields & Types | Relationships & Rules |
| :--- | :--- | :--- |
| **Users** | `_id` (ObjectId)<br>`name` (String, required)<br>`email` (String, required, unique)<br>`password` (String, required, min 8)<br>`role` (String, enum: ['customer', 'manager']) | One user can place multiple orders and reservations. Password stored as bcrypt hash. |
| **MenuItems** | `_id` (ObjectId)<br>`name` (String, required)<br>`description` (String, required)<br>`price` (Number, min: 0)<br>`category` (String, enum)<br>`image` (String)<br>`isSpecial` (Boolean)<br>`isAvailable` (Boolean) | Referenced by `Orders.items.menuItem`. Price must be non-negative. |
| **Tables** | `_id` (ObjectId)<br>`tableNumber` (Number, unique)<br>`capacity` (Number, min: 1)<br>`location` (String) | Referenced by `Reservation.table`. Number must be unique. |
| **Reservations** | `_id` (ObjectId)<br>`customer` (ObjectId → User)<br>`table` (ObjectId → Table)<br>`date` (String, YYYY-MM-DD)<br>`time` (String, HH:MM)<br>`guestCount` (Number, min: 1)<br>`specialRequests` (String)<br>`status` (String, enum) | References User and Table. Conflict check enforces no overlapping booking for same table/date/time. Timestamps enabled. |
| **Orders** | `_id` (ObjectId)<br>`customer` (ObjectId → User)<br>`items` (Array of Subdocuments)<br>`total` (Number, min: 0)<br>`status` (String, enum)<br>`specialInstructions` (String) | References User and MenuItems. Total calculated server-side from DB prices. Timestamps enabled. |

---

### 4. API Endpoints Summary (Section 8)

| Method | Endpoint | Access | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/health` | Public | None | `{ status, time }` |
| POST | `/api/auth/register` | Public | name, email, password, role | token, user object |
| POST | `/api/auth/login` | Public | email, password | token, user object |
| GET | `/api/menu` | Public | None (Optional `category`, `search` query params) | Array of menu items |
| GET | `/api/menu/:id` | Public | None | Single menu item object |
| POST | `/api/menu` | Manager Only | name, description, price, category, etc. | Created menu item (201) |
| PUT | `/api/menu/:id` | Manager Only | Updated fields (price, availability) | Updated menu item (200) |
| DELETE | `/api/menu/:id` | Manager Only | None | Success message (200) |
| POST | `/api/orders` | Customer | items array, specialInstructions | Created order object (201) |
| GET | `/api/orders/my` | Customer | None | List of customer's orders |
| GET | `/api/orders` | Manager Only | None | List of all system orders |
| PATCH | `/api/orders/:id/status` | Manager Only | status (Preparing, Ready, Served, Cancelled) | Updated order object |
| POST | `/api/reservations` | Customer | tableId, date, time, guestCount | Created reservation object (201) |
| GET | `/api/reservations/my` | Customer | None | List of customer's reservations |
| GET | `/api/reservations` | Manager Only | None | List of all system reservations |
| PATCH | `/api/reservations/:id` | Manager Only | status (Confirmed, Declined, Cancelled) | Updated reservation object |

