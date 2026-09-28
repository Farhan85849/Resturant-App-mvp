// src/screens/MenuScreen.js
// Q4 (useState, useEffect) + Q5 (useRef, useDebounce) + Q8 (useMemo, useCallback, React.memo)
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { categories } from '../data/menu';
import MenuItemCard from '../components/MenuItemCard';
import useDebounce from '../hooks/useDebounce';

const SORT_OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'name_asc', label: 'A → Z' },
];

export default function MenuScreen({ navigation }) {
  const { theme } = useTheme();
  const { dispatch } = useCart();
  const { menuItems } = useMenu();

  // ── Q4 state ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState('default');
  const [favourites, setFavourites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // ── Q5 refs ───────────────────────────────────────────────────────────────
  const searchRef = useRef(null);

  // ── Q9 debounced search ───────────────────────────────────────────────────
  const debouncedSearch = useDebounce(searchText, 400);

  // ── Q4: simulate fetch on mount ──────────────────────────────────────────
  const simulateFetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      // Randomly fail 10% of the time for demo purposes
      if (Math.random() < 0.1) {
        setError('Could not load menu. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer); // cleanup
  }, []);

  useEffect(() => {
    const cleanup = simulateFetch();
    return cleanup; // returned cleanup prevents state update after unmount
  }, [simulateFetch]);

  // ── Q4: update header title with item count ───────────────────────────────
  // (Computed inside the useMemo below, then applied via a separate effect)

  // ── Q8: single useMemo for filter + search + sort ─────────────────────────
  // Derived data should NOT be stored in state because:
  // 1) State causes an extra render cycle (set state → re-render → re-derive).
  // 2) It requires a useEffect to keep it in sync, which is error-prone.
  // 3) useMemo computes synchronously during the render — always consistent.
  const displayedItems = useMemo(() => {
    let items = [...menuItems];

    // Category filter
    if (selectedCategory !== 'All') {
      items = items.filter((i) => i.category === selectedCategory);
    }

    // Search filter (debounced)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortKey) {
      case 'price_asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return items;
  }, [menuItems, selectedCategory, debouncedSearch, sortKey]);

  // ── Q4: update header title ───────────────────────────────────────────────
  useEffect(() => {
    navigation.setOptions({ title: `Menu (${displayedItems.length} items)` });
  }, [displayedItems.length, navigation]);

  // ── Q8: stable callbacks for React.memo children ─────────────────────────
  const handleAddToCart = useCallback(
    (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    [dispatch]
  );

  const handleToggleFavourite = useCallback(
    (id) =>
      setFavourites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      ),
    []
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const s = styles(theme);

  if (isLoading) {
    return (
      <View style={[s.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 12 }}>Loading menu…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.error, fontSize: 16, marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={simulateFetch}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      {/* Search bar – Q5 */}
      <View style={s.searchRow}>
        <TouchableOpacity onPress={() => searchRef.current?.focus()}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
        </TouchableOpacity>
        <TextInput
          ref={searchRef}
          style={s.searchInput}
          placeholder="Search menu…"
          placeholderTextColor={theme.placeholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              searchRef.current?.focus();
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[s.chip, selectedCategory === cat && s.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[s.chipText, selectedCategory === cat && s.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.sortScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortChip, sortKey === opt.key && s.sortChipActive]}
            onPress={() => setSortKey(opt.key)}
          >
            <Text style={[s.sortText, sortKey === opt.key && s.sortTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {displayedItems.length === 0 ? (
        <View style={s.centered}>
          <Text style={{ color: theme.textSecondary }}>No items match your search.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onAddToCart={handleAddToCart}
              onToggleFavourite={handleToggleFavourite}
              isFavourite={favourites.includes(item.id)}
            />
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.inputBg, borderRadius: 12, margin: 16,
      paddingHorizontal: 12, paddingVertical: 10,
      borderWidth: 1, borderColor: theme.border,
    },
    searchInput: { flex: 1, color: theme.text, fontSize: 15 },
    chipScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 8 },
    chip: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      backgroundColor: theme.chipBg, marginRight: 8, borderWidth: 1, borderColor: theme.border,
    },
    chipActive: { backgroundColor: theme.chipActive, borderColor: theme.chipActive },
    chipText: { color: theme.chipText, fontWeight: '600', fontSize: 13 },
    chipTextActive: { color: theme.chipActiveText },
    sortScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 8 },
    sortChip: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
      backgroundColor: theme.chipBg, marginRight: 8, borderWidth: 1, borderColor: theme.border,
    },
    sortChipActive: { backgroundColor: theme.primary + '22', borderColor: theme.primary },
    sortText: { color: theme.chipText, fontSize: 12 },
    sortTextActive: { color: theme.primary, fontWeight: '700' },
    retryBtn: {
      backgroundColor: theme.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10,
    },
    retryText: { color: '#fff', fontWeight: '700' },
  });
