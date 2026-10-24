const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Reservation = require('./models/Reservation');

const seedUsers = [
  {
    name: 'Demo Customer',
    email: 'customer@demo.com',
    password: 'Customer1',
    role: 'customer',
  },
  {
    name: 'Demo Manager',
    email: 'manager@demo.com',
    password: 'Manager1',
    role: 'manager',
  },
];

const seedMenuItems = [
  { name: 'Crispy Spring Rolls', description: 'Golden fried rolls stuffed with spiced vegetables and glass noodles.', price: 350, category: 'Starters', image: 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80', isSpecial: true, isAvailable: true },
  { name: 'Chicken Tikka Platter', description: 'Juicy marinated boneless chicken skewers served with mint chutney and greens.', price: 650, category: 'Starters', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Garlic Bread with Mozzarella', description: 'Artisan baguette toasted with herbed garlic butter, herbs, and melted cheese.', price: 220, category: 'Starters', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Seekh Kebab', description: 'Minced beef kebabs seasoned with aromatic herbs and char-grilled on skewers.', price: 580, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80', isSpecial: true, isAvailable: false },
  { name: 'Butter Chicken Special', description: 'Tender tandoori chicken simmered in a velvet tomato, cashew, and fenugreek gravy.', price: 890, category: 'Mains', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', isSpecial: true, isAvailable: true },
  { name: 'Royal Beef Biryani', description: 'Aromatic long-grain basmati layered with tender beef, saffron, and crispy shallots.', price: 780, category: 'Mains', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Grilled Fish Fillet', description: 'Pan-seared sea bass with lemon garlic reduction, capers, and seasonal greens.', price: 1100, category: 'Mains', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Slow-Cooked Daal Makhani', description: 'Black lentils and kidney beans slow-simmered overnight with cultured cream and butter.', price: 480, category: 'Mains', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Pasta Arrabiata', description: 'Al dente penne in a fiery San Marzano tomato sauce infused with chili and basil.', price: 620, category: 'Mains', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Gulab Jamun with Pistachio', description: 'Golden caramelized milk dumplings soaked in saffron-cardamom scented syrup.', price: 220, category: 'Desserts', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Molten Chocolate Lava Cake', description: 'Rich Belgian chocolate sponge bursting with a warm ganache center and vanilla bean gelato.', price: 480, category: 'Desserts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', isSpecial: true, isAvailable: true },
  { name: 'Artisan Mango Kulfi', description: 'Traditional slow-reduced milk ice cream swirled with Alphonso mango pulp and pistachios.', price: 280, category: 'Desserts', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Fresh Mango Lassi', description: 'Creamy sweet yogurt drink blended with ripe mangoes and cardamom seeds.', price: 250, category: 'Drinks', image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Sparkling Mint Lemonade', description: 'Zesty lemon cooler crushed with garden fresh spearmint and Himalayan pink salt.', price: 180, category: 'Drinks', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: true },
  { name: 'Signature Cold Brew', description: '18-hour slow-steeped Arabica coffee served chilled over ice with oat milk.', price: 320, category: 'Drinks', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', isSpecial: true, isAvailable: true },
  { name: 'Royal Rose Sharbat', description: 'Heritage chilled Damascus rose essence drink garnished with sabja seeds.', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', isSpecial: false, isAvailable: false },
];

const seedTables = [
  { tableNumber: 1, capacity: 2, location: 'Window' },
  { tableNumber: 2, capacity: 4, location: 'Main Hall' },
  { tableNumber: 3, capacity: 4, location: 'Main Hall' },
  { tableNumber: 4, capacity: 6, location: 'Garden' },
  { tableNumber: 5, capacity: 8, location: 'Private Room' },
  { tableNumber: 6, capacity: 2, location: 'Bar' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear all collections
    await Order.deleteMany();
    await Reservation.deleteMany();
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Table.deleteMany();
    console.log('Collections cleared.');

    // Hash passwords for seeded users
    const hashedUsers = await Promise.all(
      seedUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 12),
      }))
    );

    await User.insertMany(hashedUsers);
    console.log(`Seeded ${hashedUsers.length} users.`);

    await MenuItem.insertMany(seedMenuItems);
    console.log(`Seeded ${seedMenuItems.length} menu items.`);

    await Table.insertMany(seedTables);
    console.log(`Seeded ${seedTables.length} tables.`);

    console.log('\n✅ Seeding complete!');
    console.log('  Customer: customer@demo.com / Customer1');
    console.log('  Manager:  manager@demo.com  / Manager1');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
