// src/data/menu.js
// Mock menu data with 15+ items across 4+ categories

const menuItems = [
  // ─── Starters ────────────────────────────────────────────────────
  {
    id: 'm1',
    name: 'Crispy Spring Rolls',
    description: 'Golden fried rolls stuffed with spiced vegetables and glass noodles.',
    price: 350,
    category: 'Starters',
    // Crispy golden spring rolls with dipping sauce on dark plate
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
    isSpecial: true,
    isAvailable: true,
  },
  {
    id: 'm2',
    name: 'Chicken Tikka Platter',
    description: 'Juicy marinated boneless chicken skewers served with mint chutney and greens.',
    price: 650,
    category: 'Starters',
    // Grilled chicken tikka skewers with charred marks served on plate
    image: 'https://images.unsplash.com/photo-1689530951865-ac55bab8e7ba?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm3',
    name: 'Garlic Bread with Mozzarella',
    description: 'Artisan baguette toasted with herbed garlic butter, herbs, and melted cheese.',
    price: 220,
    category: 'Starters',
    // Toasted garlic bread slices with melted mozzarella cheese
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm4',
    name: 'Seekh Kebab',
    description: 'Minced beef kebabs seasoned with aromatic herbs and char-grilled on skewers.',
    price: 580,
    category: 'Starters',
    // Minced meat seekh kebabs on skewers with spices
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
    isSpecial: true,
    isAvailable: false,
  },

  // ─── Mains ───────────────────────────────────────────────────────
  {
    id: 'm5',
    name: 'Butter Chicken Special',
    description: 'Tender tandoori chicken simmered in a velvet tomato, cashew, and fenugreek gravy.',
    price: 890,
    category: 'Mains',
    // Creamy orange butter chicken curry in bowl with garnish
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    isSpecial: true,
    isAvailable: true,
  },
  {
    id: 'm6',
    name: 'Royal Beef Biryani',
    description: 'Aromatic long-grain basmati layered with tender beef, saffron, and crispy shallots.',
    price: 780,
    category: 'Mains',
    // Aromatic biryani rice with meat and saffron in a pot overhead view
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm7',
    name: 'Grilled Fish Fillet',
    description: 'Pan-seared sea bass with lemon garlic reduction, capers, and seasonal greens.',
    price: 1100,
    category: 'Mains',
    // Golden pan-seared fish fillet with lemon and herbs on plate
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm8',
    name: 'Slow-Cooked Daal Makhani',
    description: 'Black lentils and kidney beans slow-simmered overnight with cultured cream and butter.',
    price: 480,
    category: 'Mains',
    // Creamy dark daal makhani lentils in black bowl with cream swirl
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm9',
    name: 'Pasta Arrabiata',
    description: 'Al dente penne in a fiery San Marzano tomato sauce infused with chili and basil.',
    price: 620,
    category: 'Mains',
    // Penne pasta in spicy red tomato arrabiata sauce with basil
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },

  // ─── Desserts ─────────────────────────────────────────────────────
  {
    id: 'm10',
    name: 'Gulab Jamun with Pistachio',
    description: 'Golden caramelized milk dumplings soaked in saffron-cardamom scented syrup.',
    price: 220,
    category: 'Desserts',
    // Brown gulab jamun dumplings in golden syrup with rose petals
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm11',
    name: 'Molten Chocolate Lava Cake',
    description: 'Rich Belgian chocolate sponge bursting with a warm ganache center and vanilla bean gelato.',
    price: 480,
    category: 'Desserts',
    // Molten chocolate lava cake with flowing ganache center and ice cream
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
    isSpecial: true,
    isAvailable: true,
  },
  {
    id: 'm12',
    name: 'Artisan Mango Kulfi',
    description: 'Traditional slow-reduced milk ice cream swirled with Alphonso mango pulp and pistachios.',
    price: 280,
    category: 'Desserts',
    // Mango kulfi ice cream bars with pistachio on rustic surface
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },

  // ─── Drinks ───────────────────────────────────────────────────────
  {
    id: 'm13',
    name: 'Fresh Mango Lassi',
    description: 'Creamy sweet yogurt drink blended with ripe mangoes and cardamom seeds.',
    price: 250,
    category: 'Drinks',
    // Bright yellow mango lassi in glass with mango slice garnish
    image: 'https://images.unsplash.com/photo-1626201850129-a4a6f27a830b?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm14',
    name: 'Sparkling Mint Lemonade',
    description: 'Zesty lemon cooler crushed with garden fresh spearmint and Himalayan pink salt.',
    price: 180,
    category: 'Drinks',
    // Chilled sparkling lemonade with fresh mint leaves and lemon slice
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: true,
  },
  {
    id: 'm15',
    name: 'Signature Cold Brew',
    description: '18-hour slow-steeped Arabica coffee served chilled over ice with oat milk.',
    price: 320,
    category: 'Drinks',
    // Dark cold brew coffee over ice in glass with condensation
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    isSpecial: true,
    isAvailable: true,
  },
  {
    id: 'm16',
    name: 'Royal Rose Sharbat',
    description: 'Heritage chilled Damascus rose essence drink garnished with sabja seeds.',
    price: 150,
    category: 'Drinks',
    // Deep pink rose sharbat drink with floral garnish in tall glass
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    isSpecial: false,
    isAvailable: false,
  },
];

export const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

export default menuItems;
