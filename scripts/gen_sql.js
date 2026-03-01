
const fs = require('fs');
const brandId = '2697f4b7-5ddd-4022-b31d-718e6fd24c2c'; // VALENTINO
const catId = '62b22c0d-4857-421f-a106-9b05dc406879'; // Arabe
const genderId = '8895bc8e-4b77-460b-a468-f0ee8ff30794'; // Para Hombre
const img = 'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771856993/WhatsApp_Image_2026-02-23_at_9.29.31_AM_fcfsuw.jpg';

const perfumes = [
    'Bleu Electrique', 'Night Vision', 'Royal Amber', 'Silver Scent', 'Golden Oud',
    'Midnight Rose', 'Ocean Breeze', 'Desert Wind', 'Velvet Vanilla', 'Silk Musk',
    'Leather Intense', 'Aqua Marine', 'Deep Forest', 'Sunny Citrus', 'Black Opium',
    'White Linen', 'Morning Dew', 'Summer Rain', 'Winter Frost', 'Autumn Leaves',
    'Spicy Pepper', 'Sweet Cherry', 'Bitter Almond', 'Fresh Mint', 'Herbal Garden',
    'Floral Nectar', 'Berry Blast', 'Tropical Dream', 'Classic Wood', 'Modern Metal',
    'Urban Spirit', 'Wild Soul', 'Pure Essence', 'Grandeur', 'Prestige',
    'Elegance', 'Majesty', 'Sovereign', 'Empire', 'Dynasty',
    'Legend', 'Icon', 'Masterpiece', 'Artifact', 'Enigma',
    'Paradox', 'Mystery', 'Secret', 'Shadow', 'Light'
];

let query = 'INSERT INTO public.products (name, brand_id, gender_id, category_ids, description, price, volume_ml, quality, is_active, images) VALUES\n';
const values = perfumes.map((name, i) => {
    const price = 80000 + (Math.floor(Math.random() * 40) * 10000);
    return `('${name}', '${brandId}', '${genderId}', '{"${catId}"}', 'Fragancia exclusiva con notas premium y larga duración.', ${price}, 100, 'Inspiración', true, '{"${img}"}')`;
}).join(',\n');

fs.writeFileSync('scripts/insert_products.sql', query + values + ';');
console.log('SQL generated in scripts/insert_products.sql');
