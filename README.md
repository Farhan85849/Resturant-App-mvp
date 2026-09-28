# Restaurant App MVP (Frontend Only)

A full-featured React Native frontend application for a restaurant management system, built strictly without any backend or external state management libraries (like Redux/Zustand), as per requirements.

## Features
* **Role-Based Authentication**: Login as a Customer or a Restaurant Manager.
* **Menu Browsing**: Filter, search (debounced), and sort items with a `useMemo` optimized list. 
* **Cart Management**: Pure `useReducer` implementation supporting increment, decrement (with auto-remove), promo codes, and special notes.
* **Table Reservation**: Form validation using custom hooks, preventing overlapping table bookings.
* **Order Tracking**: Simulated real-time order progression (Pending -> Preparing -> Ready -> Served) using `setInterval` inside `useEffect`.
* **Manager Dashboard**: Role-restricted access allowing managers to modify menu prices/availability, accept reservations, and progress order statuses manually.
* **Dark Mode Support**: `useContext`-based global theme switching.
* **Local Persistence**: `AsyncStorage` used within context effects to save orders, reservations, and menu changes between app restarts.

---

## Installation & Setup

1. **Prerequisites**: 
   * [Node.js](https://nodejs.org/) (v18+ recommended)
   * The Expo CLI

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the App**:
   ```bash
   npx expo start
   ```

4. **Run on Emulator / Device**:
   * Press `a` in the terminal to open on an Android emulator.
   * Press `i` in the terminal to open on an iOS simulator (macOS only).
   * Or, scan the QR code using the **Expo Go** app on your physical mobile device.

---

## Mock Login Credentials

**Customer Account:**
* Email: `customer@demo.com`
* Password: `Customer1`

**Manager Account:**
* Email: `manager@demo.com`
* Password: `Manager1`

*(Or you can sign up for a new account from the Login screen!)*

---

## Hooks Usage Map

| Hook | Used in Screens/Components | Purpose |
|------|---------------------------|---------|
| `useState` | All screens, `useForm`, `useReservation`, `useDebounce` | Local UI state, forms, toggles, active tabs. |
| `useEffect` | `MenuScreen`, `OrderTrackingScreen`, Context files | Fetching mock data, managing `setInterval` for tracking, loading/saving `AsyncStorage`. |
| `useRef` | `MenuScreen` | Storing a reference to the search `TextInput` to persist focus. |
| `useContext` | All screens | Consuming global state for Auth, Theme, Cart, Menu, Orders, and Reservations. |
| `useReducer` | `CartContext`, `OrdersContext` | Managing complex state transitions for cart logic and order flow. |
| `useMemo` | `MenuScreen`, `OrderSummaryScreen` | Caching derived data (filtered/sorted menu items, cart total computations). |
| `useCallback` | `LoginScreen`, `MenuScreen`, `MenuItemCard` | Stabilizing function references (API mock calls, add-to-cart handlers) to prevent re-renders of memoized child components. |
| `React.memo` | `MenuItemCard` | Preventing re-rendering of menu items in the `FlatList` unless their specific props change. |
| *Custom Hooks* | `LoginScreen`, `MenuScreen`, `ReservationScreen` | `useForm`, `useDebounce`, `useReservation` - abstracting business logic out of the UI layer. |

---

## Context vs Prop Drilling

**Why Context suits this app better than Prop Drilling:**
Data like the authenticated `user` and the current UI `theme` are required by almost every screen and component deeply nested in the app (headers, buttons, inputs). Passing these as props through every intermediate component (prop drilling) would make the codebase brittle, hard to read, and difficult to maintain. The Context API allows any component to access this global data directly via consumer hooks.

**One drawback of Context:**
All components that consume a context will automatically re-render whenever the context value changes, even if they only needed a small part of that value.

---

## Cart Reducer Test Cases

| Action | Initial State | Expected State |
|--------|---------------|----------------|
| `ADD_ITEM` | `items: []` | `items: [{id: 'm1', quantity: 1, note: ''}]` |
| `ADD_ITEM` (Existing) | `items: [{id: 'm1', quantity: 1}]` | `items: [{id: 'm1', quantity: 2}]` |
| `INCREMENT` | `items: [{id: 'm2', quantity: 1}]` | `items: [{id: 'm2', quantity: 2}]` |
| `DECREMENT` | `items: [{id: 'm2', quantity: 2}]` | `items: [{id: 'm2', quantity: 1}]` |
| `DECREMENT` (qty:1)| `items: [{id: 'm2', quantity: 1}]` | `items: []` |
| `APPLY_PROMO` | `promoCode: null, discountPercent: 0` | `promoCode: 'WELCOME10', discountPercent: 10` |

---

## useReducer vs useState for Cart

**Comparison:**
For the cart, `useReducer` is superior because it centralises the logic for multiple complex actions (add, remove, increment, decrement) that all mutate the same data structure based on the previous state. With `useState`, this logic would be scattered across multiple handler functions in the component, making it harder to test and maintain.

**When `useState` would have been enough:**
If the cart was extremely simple—e.g., just an array of IDs where items could only be added or cleared entirely without tracking individual quantities, notes, or applying complex promo logic—then a basic `useState` array would suffice.

---

## Optimisation Constraints

**When `useMemo` and `useCallback` should NOT be used:**
These hooks should not be used prematurely for trivial calculations or components. Both hooks add memory overhead by storing the cached value and dependency arrays, and they incur a slight performance cost during the initial render to setup the memoization. If a computation is fast (like basic arithmetic) or a component is simple and cheap to re-render, adding `useMemo` or `useCallback` can actually make the app slower and the code harder to read.

---

## Demo Video

*Place your demo video link here before submission.*
