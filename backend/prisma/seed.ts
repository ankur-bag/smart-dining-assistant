import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const menuItems = [
  // Veg Starters
  { id: 'vs-001', name: 'Paneer Tikka', category: 'Veg Starters', price: 240, description: 'Chargrilled cottage cheese with mint chutney', tags: ['veg', 'spicy', 'bestseller'], allergens: ['dairy'], popularScore: 0.92, complementaryItems: ['br-001', 'bc-001'] },
  { id: 'vs-002', name: 'Veg Spring Rolls', category: 'Veg Starters', price: 180, description: 'Crispy rolls stuffed with veggies and noodles', tags: ['veg', 'light', 'crispy'], allergens: ['gluten'], popularScore: 0.75, complementaryItems: ['bc-002'] },
  { id: 'vs-003', name: 'Hara Bhara Kebab', category: 'Veg Starters', price: 200, description: 'Spinach and green pea patties, pan-fried', tags: ['veg', 'healthy'], allergens: [], popularScore: 0.68, complementaryItems: ['br-002'] },
  // Non-Veg Starters
  { id: 'nvs-001', name: 'Chilli Chicken Bites', category: 'Non-Veg Starters', price: 220, description: 'Crispy chicken tossed in spicy Indo-Chinese sauce', tags: ['non-veg', 'spicy', 'bestseller'], allergens: ['soy'], popularScore: 0.95, complementaryItems: ['bc-002', 'br-001'] },
  { id: 'nvs-002', name: 'Prawn Pepper Fry', category: 'Non-Veg Starters', price: 280, description: 'South-style pepper prawns with curry leaves', tags: ['non-veg', 'spicy', 'seafood'], allergens: ['shellfish'], popularScore: 0.88, complementaryItems: ['br-003'] },
  { id: 'nvs-003', name: 'Tandoori Fish Tikka', category: 'Non-Veg Starters', price: 260, description: 'Light marinade, smoky tandoor fish cubes', tags: ['non-veg', 'light', 'seafood'], allergens: ['fish'], popularScore: 0.82, complementaryItems: ['bc-001'] },
  // Mains Veg
  { id: 'mv-001', name: 'Palak Paneer', category: 'Mains Veg', price: 260, description: 'Creamy spinach curry with soft paneer cubes', tags: ['veg', 'main', 'mild'], allergens: ['dairy'], popularScore: 0.85, complementaryItems: ['br-001', 'br-002'] },
  { id: 'mv-002', name: 'Dal Makhani', category: 'Mains Veg', price: 220, description: 'Slow-cooked black lentils in buttery tomato gravy', tags: ['veg', 'main', 'filling'], allergens: ['dairy'], popularScore: 0.9, complementaryItems: ['br-001'] },
  { id: 'mv-003', name: 'Mushroom Masala', category: 'Mains Veg', price: 240, description: 'Button mushrooms in rich onion-tomato masala', tags: ['veg', 'main', 'spicy'], allergens: [], popularScore: 0.7, complementaryItems: ['br-002'] },
  // Mains Non-Veg
  { id: 'mnv-001', name: 'Butter Chicken', category: 'Mains Non-Veg', price: 320, description: 'Tender chicken in velvety tomato-butter gravy', tags: ['non-veg', 'main', 'bestseller'], allergens: ['dairy'], popularScore: 0.98, complementaryItems: ['br-001', 'bc-002'] },
  { id: 'mnv-002', name: 'Hyderabadi Chicken Biryani', category: 'Mains Non-Veg', price: 340, description: 'Fragrant basmati rice layered with spiced chicken', tags: ['non-veg', 'main', 'spicy', 'filling'], allergens: [], popularScore: 0.96, complementaryItems: ['bc-002', 'd-001'] },
  { id: 'mnv-003', name: 'Fish Curry', category: 'Mains Non-Veg', price: 300, description: 'Coastal-style coconut fish curry', tags: ['non-veg', 'main', 'seafood'], allergens: ['fish'], popularScore: 0.78, complementaryItems: ['br-003'] },
  // Breads & Rice
  { id: 'br-001', name: 'Butter Naan', category: 'Breads & Rice', price: 60, description: 'Soft tandoor naan brushed with butter', tags: ['veg', 'bread'], allergens: ['gluten', 'dairy'], popularScore: 0.93, complementaryItems: [] },
  { id: 'br-002', name: 'Garlic Naan', category: 'Breads & Rice', price: 70, description: 'Naan topped with roasted garlic and coriander', tags: ['veg', 'bread'], allergens: ['gluten', 'dairy'], popularScore: 0.87, complementaryItems: [] },
  { id: 'br-003', name: 'Steamed Rice', category: 'Breads & Rice', price: 120, description: 'Fragrant basmati rice, plain', tags: ['veg', 'light'], allergens: [], popularScore: 0.65, complementaryItems: [] },
  // Desserts
  { id: 'd-001', name: 'Gulab Jamun', category: 'Desserts', price: 120, description: 'Warm milk dumplings in rose-cardamom syrup', tags: ['veg', 'sweet', 'dessert'], allergens: ['dairy'], popularScore: 0.91, complementaryItems: ['bh-001'] },
  { id: 'd-002', name: 'Rasmalai', category: 'Desserts', price: 140, description: 'Soft cheese discs in saffron milk', tags: ['veg', 'sweet', 'dessert'], allergens: ['dairy'], popularScore: 0.84, complementaryItems: [] },
  { id: 'd-003', name: 'Chocolate Brownie', category: 'Desserts', price: 160, description: 'Warm fudge brownie with vanilla ice cream', tags: ['veg', 'sweet', 'dessert'], allergens: ['dairy', 'gluten'], popularScore: 0.8, complementaryItems: ['bc-001'] },
  // Beverages Hot
  { id: 'bh-001', name: 'Masala Chai', category: 'Beverages Hot', price: 60, description: 'Spiced Indian tea with ginger and cardamom', tags: ['veg', 'beverage', 'drink'], allergens: ['dairy'], popularScore: 0.88, complementaryItems: [] },
  { id: 'bh-002', name: 'Filter Coffee', category: 'Beverages Hot', price: 70, description: 'South Indian decoction coffee with frothy milk', tags: ['veg', 'beverage', 'drink'], allergens: ['dairy'], popularScore: 0.76, complementaryItems: [] },
  // Beverages Cold
  { id: 'bc-001', name: 'Mango Lassi', category: 'Beverages Cold', price: 90, description: 'Thick yogurt drink blended with Alphonso mango', tags: ['veg', 'beverage', 'drink', 'sweet'], allergens: ['dairy'], popularScore: 0.89, complementaryItems: [] },
  { id: 'bc-002', name: 'Fresh Lime Soda', category: 'Beverages Cold', price: 80, description: 'Sweet or salted lime soda, freshly mixed', tags: ['veg', 'beverage', 'drink', 'light'], allergens: [], popularScore: 0.83, complementaryItems: [] },
  // Combos & Deals
  { id: 'cd-001', name: 'Lunch Thali Combo', category: 'Combos & Deals', price: 350, description: 'Dal, sabzi, rice, roti, papad, pickle and dessert', tags: ['veg', 'combo', 'filling', 'bestseller'], allergens: ['gluten', 'dairy'], popularScore: 0.94, complementaryItems: ['bc-002'] },
  { id: 'cd-002', name: 'Family Feast Deal', category: 'Combos & Deals', price: 899, description: '2 starters, 2 mains, breads, rice and 4 drinks', tags: ['combo', 'filling', 'deal'], allergens: [], popularScore: 0.86, complementaryItems: [] },
  // Extra items for variety
  { id: 'vs-004', name: 'Corn Cheese Balls', category: 'Veg Starters', price: 190, description: 'Golden fried corn and cheese croquettes', tags: ['veg', 'cheesy'], allergens: ['dairy', 'gluten'], popularScore: 0.72, complementaryItems: ['bc-002'] },
  { id: 'nvs-004', name: 'Chicken 65', category: 'Non-Veg Starters', price: 250, description: 'Fiery deep-fried chicken with curry leaves', tags: ['non-veg', 'spicy'], allergens: [], popularScore: 0.9, complementaryItems: ['bc-002'] },
  { id: 'pack-001', name: 'Bottled Water', category: 'Beverages Cold', price: 40, description: 'Packaged mineral water 500ml', tags: ['veg', 'beverage', 'packaged'], allergens: [], popularScore: 0.5, complementaryItems: [] },
]

async function main() {
  console.log('Seeding menu items...')
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        tags: item.tags,
        allergens: item.allergens,
        available: true,
        popularScore: item.popularScore,
        complementaryItems: item.complementaryItems,
      },
      create: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        tags: item.tags,
        allergens: item.allergens,
        available: true,
        popularScore: item.popularScore,
        complementaryItems: item.complementaryItems,
      },
    })
  }
  console.log(`Seeded ${menuItems.length} menu items`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
