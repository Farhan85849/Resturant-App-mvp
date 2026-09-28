// src/reducers/cartReducer.js
// Pure reducer – never mutates previous state

export const PROMO_CODES = {
  WELCOME10: 10,
  FEAST20: 20,
  SUMMER15: 15,
};

export const initialCartState = {
  items: [],          // { ...menuItem, quantity, note }
  promoCode: null,
  discountPercent: 0,
  promoError: null,
};

export default function cartReducer(state, action) {
  switch (action.type) {

    // ── ADD_ITEM ──────────────────────────────────────────────────────
    case 'ADD_ITEM': {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1, note: '' }],
      };
    }

    // ── REMOVE_ITEM ───────────────────────────────────────────────────
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    // ── INCREMENT ─────────────────────────────────────────────────────
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };

    // ── DECREMENT – removes when qty reaches 0 ────────────────────────
    case 'DECREMENT': {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return state;
      if (item.quantity <= 1) {
        return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }

    // ── UPDATE_NOTE ───────────────────────────────────────────────────
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, note: action.payload.note } : i
        ),
      };

    // ── CLEAR_CART ────────────────────────────────────────────────────
    case 'CLEAR_CART':
      return initialCartState;

    // ── APPLY_PROMO ───────────────────────────────────────────────────
    case 'APPLY_PROMO': {
      const code = action.payload.trim().toUpperCase();
      const discount = PROMO_CODES[code];
      if (discount !== undefined) {
        return { ...state, promoCode: code, discountPercent: discount, promoError: null };
      }
      return { ...state, promoError: `"${action.payload}" is not a valid promo code.` };
    }

    // ── REMOVE_PROMO ──────────────────────────────────────────────────
    case 'REMOVE_PROMO':
      return { ...state, promoCode: null, discountPercent: 0, promoError: null };

    default:
      return state;
  }
}
