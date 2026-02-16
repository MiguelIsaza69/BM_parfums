-- 1. Change schema to use simple TEXT for images to avoid "braces" {} issues
-- We drop and recreate to ensure it's clean (since we are seeding fresh data)
-- WARNING: This deletes existing image data if any, but since we are re-seeding, it should be fine.
ALTER TABLE public.products DROP COLUMN IF EXISTS images;
ALTER TABLE public.products ADD COLUMN images TEXT DEFAULT '';

-- 2. Insert 40 perfumes with simple text URL strings
INSERT INTO public.products (name, brand_id, gender_id, category_ids, description, price, volume_ml, quality, images)
VALUES
-- 1. JPG Scandal Pour Homme
(
    'Scandal Pour Homme',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1)],
    'Scandal Pour Homme es una fragancia de la familia olfativa Ámbar Amaderada para Hombres. Una oda a la masculinidad con un toque dulce y provocativo.',
    420000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273375/scandalhombre_pbz6vr.webp'
),
-- 2. Le Beau Paradise Garden
(
    'Le Beau Paradise Garden',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Tropicales' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Un viaje olfativo a un jardín paradisíaco. Notas de coco, higo y sándalo se mezclan para crear una experiencia fresca y exótica.',
    480000,
    125,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273376/perfumeLeBeauParadiseGardenJeanPaulGaultier_ezopoo.webp'
),
-- 3. Le Male
(
    'Le Male',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1)],
    'El clásico irresistible. Le Male rinde homenaje a la figura simbólica que siempre ha inspirado a Jean Paul Gaultier: el marinero.',
    390000,
    125,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273377/JPG-Le-Male-02_e99gia.webp'
),
-- 4. Boss Bottled
(
    'Boss Bottled',
    (SELECT id FROM public.brands WHERE name = 'HUGO BOSS' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1)],
    'BOSS Bottled es una fragancia versátil y rica en contrastes, diseñada para el hombre moderno y ambicioso.',
    280000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273379/boss06-1516233257_gwe8d3.avif'
),
-- 5. Oud For Glory
(
    'Oud For Glory',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Unisex' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'Una fragancia lujosa y majestuosa con notas predominantes de Oud, azafrán y nuez moscada. Alta duración y estela.',
    210000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273381/LattafaOudForGlory_j2bjyr.webp'
),
-- 6. Sauvage Eau de Parfum
(
    'Sauvage V1',
    (SELECT id FROM public.brands WHERE name = 'CHRISTIAN DIOR' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Cítricos' LIMIT 1)],
    'Frescura radical, cruda y noble a la vez. Sauvage es un acto de creación inspirado en los grandes espacios abiertos.',
    550000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273382/perfume-dior_nrg7qd.webp'
),
-- 7. Aventus Imperial
(
    'Aventus Imperial',
    (SELECT id FROM public.brands WHERE name = 'CREED' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'De nicho' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Cítricos' LIMIT 1)],
    'Inspirado en la vida dramática de un emperador histórico, celebrando la fuerza, el poder y el éxito.',
    1200000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273386/D_864490-MLA81868750481_012025-C_qkml1q.jpg'
),
-- 8. Delilah Pour Femme
(
    'Delilah Pour Femme',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Mujer' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Florales' LIMIT 1)],
    'Una fragancia floral suave y sedosa, inspirada en Delina. Notas de rosa turca, peonía y vainilla.',
    180000,
    100,
    'Inspiración',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273389/DELILAH_kjrlsi.webp'
),
-- 9. Amber Oud Blue Edition
(
    'Amber Oud Blue Edition',
    (SELECT id FROM public.brands WHERE name = 'AL HARAMAIN' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Un aroma cítrico y amaderado que evoca frescura y poder. Similar a Bleu de Chanel pero con un toque oriental.',
    240000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273391/AL-HARAMAIN-AMBER-OUD-BLUE-EDITION-X-200ML-300x300_jeuvkb.webp'
),
-- 10. Amber Oud Gold Edition
(
    'Amber Oud Gold Edition',
    (SELECT id FROM public.brands WHERE name = 'AL HARAMAIN' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Unisex' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Una obra maestra dulce y frutal. Notas de melón, piña y notas dulces que perduran todo el día.',
    250000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273391/AL-HARAMAIN-AMBER-OUD-BLUE-EDITION-X-200ML-300x300_jeuvkb.webp'
),
-- 11. Yara Pink
(
    'Yara Pink',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Mujer' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Yara es un perfume brillante y cremoso. Notas de orquídea, heliotropo y mandarina con un fondo de vainilla gourmand.',
    160000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273392/yara_96678c1b-9e61-4577-85e8-d39fba491ce6_im9jbs.jpg'
),
-- 12. Odyssey Mandarin Sky
(
    'Odyssey Mandarin Sky',
    (SELECT id FROM public.brands WHERE name = 'ARMAF' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Cítricos' LIMIT 1)],
    'Una explosión de mandarina vibrante con notas de caramelo y haba tonka. Inspiración directa de Scandal.',
    195000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273393/Armaf-Odyssey-Mandarin-Sky_m12lz3.webp'
),
-- 13. Honor & Glory
(
    'Honor & Glory',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Unisex' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'Una fragancia opulenta que combina especias cálidas con maderas preciosas, perfecta para quienes buscan destacar.',
    215000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273395/LATTAFAHONORBLANCA_kecxgj.webp'
),
-- 14. Hugo Red
(
    'Hugo Red',
    (SELECT id FROM public.brands WHERE name = 'HUGO BOSS' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Dinámico y lleno de energía. Una fragancia que juega con el contraste entre el frío del ruibarbo y el calor del pomelo.',
    220000,
    150,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273402/perfume-hugo-boss-_-red-eau-de-toilette-150ml-_-hombre-1_arzpax.webp'
),
-- 15. Eros Eau de Toilette
(
    'Eros Eau de Toilette',
    (SELECT id FROM public.brands WHERE name = 'VERSACE' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Amor, pasión, belleza y deseo. Eros es una fragancia para un hombre fuerte y apasionado, dueño de sí mismo. Mentolado y atalcado.',
    380000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273403/image_416a2069-e194-4a03-bf30-6b3d69a2603a_1080x_rjhxqx.webp'
),
-- 16. 1 Million
(
    '1 Million',
    (SELECT id FROM public.brands WHERE name = 'PACO RABANNE' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'El lingote de oro por excelencia. Una fragancia especiada con notas de cuero, ámbar y mandarina sanguina.',
    410000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273406/images_l8ztbk.jpg'
),
-- 17. Bleu de Chanel
(
    'Bleu de Chanel',
    (SELECT id FROM public.brands WHERE name = 'CHANEL' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Un elogio a la libertad masculina en un aromático amaderado de estela cautivadora.',
    650000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273406/11-deliciosas-lociones-que-puedes-regalarle-a-papa-por-menos-de-700-pesos-1_i4c67s.jpg'
),
-- 18. Bad Boy
(
    'Bad Boy',
    (SELECT id FROM public.brands WHERE name = 'CAROLINA HERRERA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Una fragancia potente y sofisticada para hombres singulares e irreverentes que se atreven a abrazar todas las facetas de la masculinidad.',
    460000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273410/285343-1200-1600_w5nuhe.webp'
),
-- 19. Armani Code
(
    'Armani Code',
    (SELECT id FROM public.brands WHERE name = 'GIORGIO ARMANI' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'El código de la seducción. Una fragancia oriental especiada, elegante y atemporal.',
    490000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273412/images_hksrbt.jpg'
),
-- 20. Scandal Absolu
(
    'Scandal Absolu',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1)],
    'Una versión más intensa y concentrada de Scandal. Notas de castaña y sándalo.',
    460000,
    100,
    'Inspiración',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273375/scandalhombre_pbz6vr.webp'
),
-- 21. Le Beau Le Parfum
(
    'Le Beau Le Parfum',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Tropicales' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Intensidad adictiva. Notas de piña, iris y jengibre se unen al coco en esta versión intensa.',
    510000,
    125,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273376/perfumeLeBeauParadiseGardenJeanPaulGaultier_ezopoo.webp'
),
-- 22. Ultra Male
(
    'Ultra Male',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1)],
    'El marinero rebelde. Una explosión de pera, lavanda negra y vainilla. El rey de la noche.',
    430000,
    125,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273377/JPG-Le-Male-02_e99gia.webp'
),
-- 23. Hugo Man
(
    'Hugo Man',
    (SELECT id FROM public.brands WHERE name = 'HUGO BOSS' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'Para hombres que rompen las reglas. Una fragancia fresca con manzana verde y pino.',
    260000,
    125,
    'Inspiración',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273379/boss06-1516233257_gwe8d3.avif'
),
-- 24. Badee Al Oud
(
    'Badee Al Oud Sublime',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Unisex' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Una variación sublime con notas afrutadas y rosas, manteniendo la base de oud.',
    210000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273381/LattafaOudForGlory_j2bjyr.webp'
),
-- 25. Sauvage Elixir
(
    'Sauvage Elixir',
    (SELECT id FROM public.brands WHERE name = 'CHRISTIAN DIOR' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'De nicho' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'La quintaesencia de Sauvage. Una concentración extrema de especias, lavanda y maderas licorosas.',
    750000,
    60,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273382/perfume-dior_nrg7qd.webp'
),
-- 26. Club de Nuit Intense Man
(
    'Club de Nuit Intense Man',
    (SELECT id FROM public.brands WHERE name = 'ARMAF' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Cítricos' LIMIT 1)],
    'Conocido como la bestia negra. Un aroma potente a limón, piña y abedul ahumado.',
    200000,
    105,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273386/D_864490-MLA81868750481_012025-C_qkml1q.jpg'
),
-- 27. Delilah Exclusif
(
    'Delilah Exclusif',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Mujer' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'Una versión más profunda y misteriosa, perfecta para la noche.',
    190000,
    100,
    'Inspiración',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273389/DELILAH_kjrlsi.webp'
),
-- 28. Amber Oud Carbon
(
    'Amber Oud Carbon',
    (SELECT id FROM public.brands WHERE name = 'AL HARAMAIN' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Inspirado en Green Irish Tweed. Fresco, verde y elegante.',
    240000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273391/AL-HARAMAIN-AMBER-OUD-BLUE-EDITION-X-200ML-300x300_jeuvkb.webp'
),
-- 29. Yara Moi
(
    'Yara Moi',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Mujer' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1)],
    'La versión blanca de Yara. Notas de jazmín y melocotón con un toque cremoso.',
    160000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273392/yara_96678c1b-9e61-4577-85e8-d39fba491ce6_im9jbs.jpg'
),
-- 30. Odyssey Homme White
(
    'Odyssey Homme White',
    (SELECT id FROM public.brands WHERE name = 'ARMAF' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'Elegancia en una botella blanca. Notas de iris y cacao, similar a Dior Homme Intense.',
    185000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273393/Armaf-Odyssey-Mandarin-Sky_m12lz3.webp'
),
-- 31. Ishq Al Shuyukh Gold
(
    'Ishq Al Shuyukh Gold',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Unisex' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'De nicho' LIMIT 1)],
    'Inspiración de Rosendo Mateu #5. Cuero, vainilla y almizcle en perfecta armonía.',
    230000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273395/LATTAFAHONORBLANCA_kecxgj.webp'
),
-- 32. Hugo Just Different
(
    'Hugo Just Different',
    (SELECT id FROM public.brands WHERE name = 'HUGO BOSS' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Para hombres que buscan inspiración en la ciudad nocturna. Menta helada y fresia.',
    220000,
    150,
    'Inspiración',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273402/perfume-hugo-boss-_-red-eau-de-toilette-150ml-_-hombre-1_arzpax.webp'
),
-- 33. Eros Flame
(
    'Eros Flame',
    (SELECT id FROM public.brands WHERE name = 'VERSACE' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Cítricos' LIMIT 1)],
    'El contraste ardiente. Notas de chinotto, pimienta negra y romero.',
    370000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273403/image_416a2069-e194-4a03-bf30-6b3d69a2603a_1080x_rjhxqx.webp'
),
-- 34. 1 Million Royal
(
    '1 Million Royal',
    (SELECT id FROM public.brands WHERE name = 'PACO RABANNE' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'La leyenda renace. Una mezcla real de cardamomo, lavanda y cedro.',
    450000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273406/images_l8ztbk.jpg'
),
-- 35. Allure Homme Sport
(
    'Allure Homme Sport',
    (SELECT id FROM public.brands WHERE name = 'CHANEL' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Fresco, tónico y sensual. Una fragancia para el hombre activo.',
    620000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273406/11-deliciosas-lociones-que-puedes-regalarle-a-papa-por-menos-de-700-pesos-1_i4c67s.jpg'
),
-- 36. Bad Boy Cobalt
(
    'Bad Boy Cobalt',
    (SELECT id FROM public.brands WHERE name = 'CAROLINA HERRERA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'Electrizante y fresco. Notas minerales de trufa y geranio.',
    480000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273410/285343-1200-1600_w5nuhe.webp'
),
-- 37. Armani Code Parfum
(
    'Armani Code Parfum',
    (SELECT id FROM public.brands WHERE name = 'GIORGIO ARMANI' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'Una reescritura del código. Iris, bergamota y haba tonka en alta concentración.',
    550000,
    75,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273412/images_hksrbt.jpg'
),
-- 38. Scandal Le Parfum
(
    'Scandal Le Parfum',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Dulces' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Diseñador' LIMIT 1)],
    'Un golpe de teatro. Geranio y haba tonka en una botella roja intensa.',
    440000,
    100,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273375/scandalhombre_pbz6vr.webp'
),
-- 39. Le Beau EDT
(
    'Le Beau EDT',
    (SELECT id FROM public.brands WHERE name = 'JEAN PAUL GAULTIER' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Tropicales' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Frescos' LIMIT 1)],
    'El pecado original. Coco y bergamota para una frescura adictiva.',
    380000,
    125,
    'Original',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273376/perfumeLeBeauParadiseGardenJeanPaulGaultier_ezopoo.webp'
),
-- 40. Asad
(
    'Asad',
    (SELECT id FROM public.brands WHERE name = 'LATTAFA' LIMIT 1),
    (SELECT id FROM public.genders WHERE name = 'Para Hombre' LIMIT 1),
    ARRAY[(SELECT id FROM public.categories WHERE name = 'Arabe' LIMIT 1), (SELECT id FROM public.categories WHERE name = 'Amaderados' LIMIT 1)],
    'Inspirado en Sauvage Elixir. Especias, vainilla y maderas.',
    140000,
    100,
    'Inspiración',
    'https://res.cloudinary.com/dbeaem1xr/image/upload/v1771273381/LattafaOudForGlory_j2bjyr.webp'
);
