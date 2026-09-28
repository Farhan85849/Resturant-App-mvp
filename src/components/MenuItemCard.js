// src/components/MenuItemCard.js
// Q8: React.memo wrapper – only re-renders when its own props change
import React, { memo } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MenuItemCard = memo(function MenuItemCard({ item, onAddToCart, onToggleFavourite, isFavourite }) {
  console.log('[MenuItemCard] render:', item.name);
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <View style={[s.card, !item.isAvailable && s.unavailable]}>
      <Image
        source={{ uri: item.image }}
        style={s.image}
        defaultSource={require('../../assets/icon.png')}
      />
      {item.isSpecial && (
        <View style={s.specialBadge}>
          <Text style={s.specialText}>⭐ Daily Special</Text>
        </View>
      )}
      {!item.isAvailable && (
        <View style={s.unavailableBadge}>
          <Text style={s.unavailableText}>Unavailable</Text>
        </View>
      )}
      <View style={s.body}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={s.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => onToggleFavourite(item.id)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Text style={{ fontSize: 20 }}>{isFavourite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
        <View style={s.footer}>
          <Text style={s.price}>Rs {item.price}</Text>
          <TouchableOpacity
            style={[s.addBtn, !item.isAvailable && s.addBtnDisabled]}
            onPress={() => onAddToCart(item)}
            disabled={!item.isAvailable}
          >
            <Text style={s.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default MenuItemCard;

const styles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card, borderRadius: 16, marginHorizontal: 16,
      marginBottom: 14, overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
      elevation: 3,
    },
    unavailable: { opacity: 0.5 },
    image: { width: '100%', height: 160, resizeMode: 'cover' },
    specialBadge: {
      position: 'absolute', top: 10, left: 10, backgroundColor: theme.specialBadge,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    specialText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    unavailableBadge: {
      position: 'absolute', top: 10, right: 10, backgroundColor: '#00000099',
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    unavailableText: { color: '#fff', fontSize: 11 },
    body: { padding: 12 },
    name: { fontSize: 16, fontWeight: '700', color: theme.text, flex: 1, marginRight: 8 },
    desc: { fontSize: 13, color: theme.textSecondary, marginTop: 4, marginBottom: 10 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 17, fontWeight: '800', color: theme.primary },
    addBtn: {
      backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 20,
    },
    addBtnDisabled: { backgroundColor: theme.disabled },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  });
