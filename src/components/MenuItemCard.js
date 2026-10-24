// src/components/MenuItemCard.js
// Modern, responsive luxury restaurant menu card with high-res food image, badges & add-to-cart
import React, { memo, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_EMOJI = {
  Starters: '🥗',
  Mains: '🍖',
  Desserts: '🍰',
  Drinks: '🍹',
};

const MenuItemCard = memo(function MenuItemCard({
  item,
  onAddToCart,
  onToggleFavourite,
  isFavourite,
  numColumns = 1,
}) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const s = styles(theme, numColumns);

  const itemId = item._id || item.id;
  const categoryIcon = CATEGORY_EMOJI[item.category] || '🍽️';

  return (
    <View style={s.cardWrapper}>
      <View style={[s.card, !item.isAvailable && s.cardDisabled]}>
        {/* Food Image Container */}
        <View style={s.imageContainer}>
          {!imageError && item.image ? (
            <Image
              source={{ uri: item.image }}
              style={s.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={s.imagePlaceholder}>
              <Text style={{ fontSize: 44 }}>{categoryIcon}</Text>
              <Text style={s.placeholderText}>{item.category || 'Dish'}</Text>
            </View>
          )}

          {/* Top Gradient Overlay for Badge Contrast */}
          <View style={s.topScrim} />

          {/* Special / Popular Badge */}
          {item.isSpecial && (
            <View style={s.specialBadge}>
              <Text style={s.specialText}>⭐ CHEF'S SPECIAL</Text>
            </View>
          )}

          {/* Unavailable Overlay */}
          {!item.isAvailable && (
            <View style={s.unavailableOverlay}>
              <View style={s.soldOutBadge}>
                <Text style={s.unavailableText}>SOLD OUT</Text>
              </View>
            </View>
          )}

          {/* Favorite Floating Button */}
          <TouchableOpacity
            style={s.favBtn}
            onPress={() => onToggleFavourite(itemId)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16 }}>{isFavourite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View style={s.body}>
          <View style={s.headerRow}>
            <View style={s.categoryPill}>
              <Text style={s.categoryTag}>
                {categoryIcon} {item.category?.toUpperCase() || 'CULINARY'}
              </Text>
            </View>
          </View>

          <Text style={s.name} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={s.desc} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Price & Add to Cart Footer */}
          <View style={s.footer}>
            <View>
              <Text style={s.priceLabel}>Price</Text>
              <Text style={s.price}>Rs {item.price}</Text>
            </View>

            <TouchableOpacity
              style={[s.addBtn, !item.isAvailable && s.addBtnDisabled]}
              onPress={() => onAddToCart(item)}
              disabled={!item.isAvailable}
              activeOpacity={0.85}
            >
              <Text style={s.addBtnText}>
                {item.isAvailable ? '+ Add to Cart' : 'Sold Out'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

export default MenuItemCard;

const styles = (theme, numColumns = 1) => {
  const isMultiCol = numColumns > 1;
  const colWidthPercent = `${(100 / (numColumns || 1)).toFixed(2)}%`;

  return StyleSheet.create({
    cardWrapper: {
      flex: isMultiCol ? 1 : undefined,
      width: isMultiCol ? undefined : '100%',
      maxWidth: isMultiCol ? colWidthPercent : '100%',
      paddingHorizontal: isMultiCol ? 8 : 16,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.isDark ? '#2e2e2e' : '#f0f2f5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.isDark ? 0.35 : 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    cardDisabled: {
      opacity: 0.72,
    },
    imageContainer: {
      width: '100%',
      height: 195,
      backgroundColor: theme.isDark ? '#222' : '#f1f5f9',
      position: 'relative',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.isDark ? '#1a1a1a' : '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    topScrim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.18)',
    },
    specialBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#E63946',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    specialText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    unavailableOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    soldOutBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    unavailableText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 1.5,
    },
    favBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    body: {
      padding: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    categoryPill: {
      backgroundColor: theme.isDark ? '#2e2025' : '#FEF2F2',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    categoryTag: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 0.6,
    },
    name: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 6,
      letterSpacing: -0.2,
    },
    desc: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 14,
      minHeight: 36,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? '#2a2a2a' : '#f0f2f5',
    },
    priceLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 2,
    },
    price: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: -0.5,
    },
    addBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 22,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 3,
    },
    addBtnDisabled: {
      backgroundColor: theme.disabled,
      shadowOpacity: 0,
    },
    addBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },
  });
};
