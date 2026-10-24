// src/screens/MenuScreen.js
// Responsive Restaurant Menu Screen for Mobile & Desktop Web
// Dynamic multi-column grid, search, category filters, sorting & hero banner

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, ScrollView, useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';
import useDebounce from '../hooks/useDebounce';
import useApi from '../hooks/useApi';
import { apiFetch } from '../api/client';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];
const SORT_OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'name_asc', label: 'A → Z' },
];

export default function MenuScreen({ navigation }) {
  const { theme } = useTheme();
  const { dispatch } = useCart();
  const { width } = useWindowDimensions();

  // Responsive columns: 3 on desktop, 2 on tablet, 1 on mobile
  const numColumns = width >= 1024 ? 3 : width >= 680 ? 2 : 1;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState('default');
  const [favourites, setFavourites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(searchText, 350);

  // Fetch menu from backend
  const fetchMenu = useCallback(() => apiFetch('/api/menu'), []);
  const { data: menuItems, loading, error, refetch } = useApi(fetchMenu, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Client-side instant filter and sort
  const displayedItems = useMemo(() => {
    if (!menuItems) return [];
    let items = [...menuItems];

    if (selectedCategory !== 'All') {
      items = items.filter((i) => i.category === selectedCategory);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    switch (sortKey) {
      case 'price_asc': items.sort((a, b) => a.price - b.price); break;
      case 'price_desc': items.sort((a, b) => b.price - a.price); break;
      case 'name_asc': items.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return items;
  }, [menuItems, selectedCategory, debouncedSearch, sortKey]);

  useEffect(() => {
    navigation.setOptions({ title: `Menu (${displayedItems.length})` });
  }, [displayedItems.length, navigation]);

  const handleAddToCart = useCallback(
    (item) => dispatch({ type: 'ADD_ITEM', payload: { ...item, id: item._id || item.id } }),
    [dispatch]
  );

  const handleToggleFavourite = useCallback(
    (id) =>
      setFavourites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      ),
    []
  );

  const s = styles(theme, width);

  if (loading && !refreshing) {
    return (
      <View style={[s.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={s.loadingText}>Crafting culinary menu…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.centered, { backgroundColor: theme.background }]}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorTitle}>Could Not Connect to Kitchen</Text>
        <Text style={s.errorDesc}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={refetch} activeOpacity={0.85}>
          <Text style={s.retryText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ListHeader = (
    <View style={s.headerContainer}>
      {/* Restaurant Hero Card */}
      <View style={s.heroCard}>
        <View style={s.heroContent}>
          <Text style={s.restaurantTitle}>🍽️ Saveur Bistro & Grill</Text>
          <Text style={s.restaurantSubtitle}>
            ⭐ 4.9 (1.2k+ reviews) • ⏱️ 20-35 min • 📍 Fine Dining
          </Text>
          <View style={s.promoPill}>
            <Text style={s.promoText}>
              🔥 Special Offer: 10% OFF all starters today!
            </Text>
          </View>
        </View>
      </View>

      {/* Modern Search Bar */}
      <View style={s.searchRow}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          ref={searchRef}
          style={s.searchInput}
          placeholder="Search artisan dishes, starters, desserts..."
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <View style={s.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[s.chip, isActive && s.chipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipText, isActive && s.chipTextActive]}>
                  {cat === 'All' && '✨ '}
                  {cat === 'Starters' && '🥗 '}
                  {cat === 'Mains' && '🍖 '}
                  {cat === 'Desserts' && '🍰 '}
                  {cat === 'Drinks' && '🍹 '}
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={s.sortSection}>
        <Text style={s.sortHeading}>SORT BY:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.sortScrollContent}
        >
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortKey === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[s.sortChip, isActive && s.sortChipActive]}
                onPress={() => setSortKey(opt.key)}
                activeOpacity={0.8}
              >
                <Text style={[s.sortText, isActive && s.sortTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <View style={s.responsiveContainer}>
        {displayedItems.length === 0 ? (
          <FlatList
            data={[]}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={
              <View style={s.emptyState}>
                <Text style={{ fontSize: 44 }}>🍽️</Text>
                <Text style={s.emptyTitle}>No matching dishes found</Text>
                <Text style={s.emptyDesc}>
                  Try selecting a different category or clearing your search term.
                </Text>
                <TouchableOpacity
                  style={s.resetBtn}
                  onPress={() => {
                    setSearchText('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={s.resetBtnText}>View Full Menu</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={displayedItems}
            keyExtractor={(item) => item._id || item.id}
            numColumns={numColumns}
            ListHeaderComponent={ListHeader}
            renderItem={({ item }) => (
              <MenuItemCard
                item={item}
                onAddToCart={handleAddToCart}
                onToggleFavourite={handleToggleFavourite}
                isFavourite={favourites.includes(item._id || item.id)}
                numColumns={numColumns}
              />
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = (theme, windowWidth) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    responsiveContainer: {
      flex: 1,
      width: '100%',
      maxWidth: 1140,
      alignSelf: 'center',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    loadingText: {
      color: theme.textSecondary,
      marginTop: 14,
      fontSize: 15,
      fontWeight: '600',
    },
    errorIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    errorDesc: {
      color: theme.error,
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
      maxWidth: 400,
    },
    retryBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 14,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    retryText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },
    listContent: {
      paddingBottom: 110,
    },
    headerContainer: {
      paddingTop: 16,
      paddingBottom: 12,
    },
    heroCard: {
      backgroundColor: theme.isDark ? '#1F1F1F' : '#FFF9F5',
      borderRadius: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.isDark ? '#333333' : '#FCE8DB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    heroContent: {
      alignItems: 'flex-start',
    },
    restaurantTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.text,
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    restaurantSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 12,
    },
    promoPill: {
      backgroundColor: theme.primary + '18',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    promoText: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      padding: 0,
    },
    clearIcon: {
      color: theme.textSecondary,
      fontSize: 16,
      paddingHorizontal: 6,
    },
    filterSection: {
      marginBottom: 12,
    },
    chipScrollContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 24,
      backgroundColor: theme.chipBg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    chipText: {
      color: theme.chipText,
      fontWeight: '700',
      fontSize: 13,
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
    sortSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    sortHeading: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      marginRight: 10,
    },
    sortScrollContent: {
      gap: 6,
    },
    sortChip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sortChipActive: {
      backgroundColor: theme.primary + '15',
      borderColor: theme.primary,
    },
    sortText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    sortTextActive: {
      color: theme.primary,
      fontWeight: '800',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginTop: 12,
      marginBottom: 6,
    },
    emptyDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      maxWidth: 320,
      marginBottom: 20,
    },
    resetBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    resetBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
  });
