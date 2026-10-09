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
  { name: 'Crispy Spring Rolls', description: 'Golden fried rolls stuffed with spiced vegetables.', price: 350, category: 'Starters', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', isSpecial: true, isAvailable: true },
  { name: 'Chicken Tikka Platter', description: 'Juicy marinated chicken tikka served with mint chutney.', price: 650, category: 'Starters', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', isSpecial: false, isAvailable: true },
  { name: 'Garlic Bread', description: 'Toasted baguette with herbed garlic butter and mozzarella.', price: 220, category: 'Starters', image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400', isSpecial: false, isAvailable: true },
  { name: 'Seekh Kebab', description: 'Minced beef and herb kebabs grilled on skewers with raita.', price: 580, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', isSpecial: true, isAvailable: false },
  { name: 'Butter Chicken', description: 'Tender chicken in a rich, creamy tomato-based curry.', price: 890, category: 'Mains', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', isSpecial: true, isAvailable: true },
  { name: 'Beef Biryani', description: 'Fragrant basmati rice layered with spiced beef and fried onions.', price: 780, category: 'Mains', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', isSpecial: false, isAvailable: true },
  { name: 'Grilled Fish Fillet', description: 'Pan-seared sea bass with lemon butter sauce and steamed greens.', price: 1100, category: 'Mains', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', isSpecial: false, isAvailable: true },
  { name: 'Daal Makhani', description: 'Black lentils slow-cooked overnight in butter and spices.', price: 480, category: 'Mains', image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400', isSpecial: false, isAvailable: true },
  { name: 'Pasta Arrabiata', description: 'Penne tossed in spicy tomato sauce with fresh basil.', price: 620, category: 'Mains', image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400', isSpecial: false, isAvailable: true },
  { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-cardamom syrup.', price: 220, category: 'Desserts', image: 'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400', isSpecial: false, isAvailable: true },
  { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey molten centre.', price: 480, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', isSpecial: true, isAvailable: true },
  { name: 'Mango Kulfi', description: 'Traditional ice cream flavoured with fresh mango and pistachios.', price: 280, category: 'Desserts', image: 'https://images.unsplash.com/photo-1633951704698-a6b8d0df0bea?w=400', isSpecial: false, isAvailable: true },
  { name: 'Mango Lassi', description: 'Chilled yoghurt and mango smoothie topped with cardamom.', price: 250, category: 'Drinks', image: 'https://images.unsplash.com/photo-1602620498524-22a15e89c39d?w=400', isSpecial: false, isAvailable: true },
  { name: 'Mint Lemonade', description: 'Freshly squeezed lemon juice with crushed mint and salt.', price: 180, category: 'Drinks', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', isSpecial: false, isAvailable: true },
  { name: 'Cold Brew Coffee', description: 'Slow-steeped cold brew served over ice with oat milk.', price: 320, category: 'Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', isSpecial: true, isAvailable: true },
  { name: 'Rose Sharbat', description: 'Classic Pakistani rose-flavoured drink with basil seeds.', price: 150, category: 'Drinks', image: 'https://images.unsplash.com/photo-1520721418169-f5f6e04a6f6e?w=400', isSpecial: false, isAvailable: false },
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
