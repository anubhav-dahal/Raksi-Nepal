// Starter catalogue. Names, prices and the first 8 products follow the prototype.
// Prices are whole NPR. image: '' means no photo yet; the app shows a placeholder.
// Paths starting with /static are served by this API (backend/public).

const img = {
    beer: 'https://static.vecteezy.com/system/resources/thumbnails/027/684/075/small/beer-and-grain-background-free-photo.jpg',
    soft: 'https://images.pexels.com/photos/4113662/pexels-photo-4113662.jpeg?auto=compress&w=1260&h=750&dpr=1',
    snacks: 'https://st5.depositphotos.com/16806292/73694/i/450/depositphotos_736943782-stock-photo-bacon-flavored-potato-chips-bowl.jpg',
    hard: 'https://images.unsplash.com/photo-1616512050184-a59742ece650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
    fanta: 'https://images.unsplash.com/photo-1625740822008-e45abf4e01d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
    chips: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
    whiskey: 'https://images.unsplash.com/photo-1696182736807-5d21e38056ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080',
};

export const categories = [
    { slug: 'beer', name: { en: 'Beer', ne: 'बियर' }, subtitle: { en: 'Chilled & ready' }, image: '/static/images/beer.jpg', alcoholic: true, sortOrder: 1 },
    { slug: 'soft-drinks', name: { en: 'Soft Drinks', ne: 'सफ्ट ड्रिंक्स' }, subtitle: { en: 'Fizz for every mood' }, image: img.soft, alcoholic: false, sortOrder: 2 },
    { slug: 'snacks', name: { en: 'Snacks', ne: 'खाजा' }, subtitle: { en: 'Crunchy favourites' }, image: img.snacks, alcoholic: false, sortOrder: 3 },
    { slug: 'hard-drinks', name: { en: 'Hard Drinks', ne: 'हार्ड ड्रिंक्स' }, subtitle: { en: 'Premium selections' }, image: img.hard, alcoholic: true, sortOrder: 4 },
];

const p = (category, slug, name, description, image, variants) => ({
    category,
    slug,
    name: { en: name },
    description: { en: description },
    image,
    variants: variants.map(([sku, label, price, stock]) => ({ sku, label, price, stock })),
});

export const products = [
    // Beer
    p('beer', 'gorkha-premium', 'Gorkha Premium', 'A crisp, refreshing lager with a smooth malt finish. Best served chilled and enjoyed responsibly.',
        'https://gorkhabrewery.com/media/pzcotbhj/gok-bottles-1116x320-strong-650ml.png?height=1140&mode=max',
        [['BEER-GORKHA-650', '650 ml bottle', 340, 48], ['BEER-GORKHA-330', '330 ml can', 220, 60]]),
    p('beer', 'tuborg-strong', 'Tuborg Strong', 'A full-bodied strong lager with balanced bitterness and a clean, satisfying finish.',
        'https://gorkhabrewery.com/media/wril11iw/np_tubog-strong.png?height=1140&mode=max',
        [['BEER-TUBORG-STR-500', '500 ml can', 285, 40]]),
    p('beer', 'tuborg-gold', 'Tuborg Gold', 'Golden, easy-drinking lager with a light hop aroma.', '',
        [['BEER-TUBORG-GLD-650', '650 ml bottle', 380, 30]]),
    p('beer', 'carlsberg', 'Carlsberg', 'Classic Danish pilsner, crisp and well balanced.', '',
        [['BEER-CARLSBERG-500', '500 ml can', 330, 24]]),
    p('beer', 'barahsinghe-pilsner', 'Barahsinghe Pilsner', 'Nepali craft-style pilsner with a clean, dry finish.', '',
        [['BEER-BARAH-650', '650 ml bottle', 360, 3]]),
    p('beer', 'nepal-ice', 'Nepal Ice', 'Strong, smooth Nepali lager. Serve ice cold.', '',
        [['BEER-NEPALICE-650', '650 ml bottle', 350, 0]]),

    // Soft drinks
    p('soft-drinks', 'coca-cola', 'Coca-Cola', 'The familiar sparkling cola made for sharing, delivered cold to your doorstep.',
        'https://media.istockphoto.com/id/458464735/photo/coke.jpg?s=612x612&w=0&k=20&c=YbmiazMmY0DkWh_W8T0pBkOgai2k62hGF1TJn9EC5W0=',
        [['SOFT-COKE-500', '500 ml can', 190, 80], ['SOFT-COKE-1250', '1.25 L bottle', 160, 40]]),
    p('soft-drinks', 'fanta', 'Fanta', 'Bright, bubbly orange refreshment with a playful fruit flavour and plenty of fizz.', img.fanta,
        [['SOFT-FANTA-500', '500 ml bottle', 95, 70]]),
    p('soft-drinks', 'sprite', 'Sprite', 'Clear lemon-lime soda, crisp and cold.', '',
        [['SOFT-SPRITE-500', '500 ml bottle', 95, 70]]),
    p('soft-drinks', 'real-mango', 'Real Mango Juice', 'Thick mango nectar from Dabur Real.', '',
        [['SOFT-REAL-MANGO-1L', '1 L pack', 230, 25]]),
    p('soft-drinks', 'red-bull', 'Red Bull', 'Energy drink for late nights and long drives.', '',
        [['SOFT-REDBULL-250', '250 ml can', 220, 4]]),
    p('soft-drinks', 'mineral-water', 'Mineral Water', 'Purified drinking water.', '',
        [['SOFT-WATER-1L', '1 L bottle', 30, 120]]),

    // Snacks
    p('snacks', 'wai-wai-quick', 'Wai Wai Quick', "Nepal's much-loved instant noodle snack. Savoury, crunchy, and ready whenever you are.",
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBLd7im91rLI8YPwoQheM1TgzayjPtb8OUF4X4GKPKqg&s=10',
        [['SNACK-WAIWAI-75', '75 g pack', 30, 150]]),
    p('snacks', 'lays-classic', 'Lays', 'Thin-cut potato chips with a golden crunch and just the right touch of sea salt.',
        'https://i.ebayimg.com/images/g/XLQAAOSwWWZhFsSQ/s-l1600.webp',
        [['SNACK-LAYS-120', '120 g pack', 145, 60], ['SNACK-LAYS-50', '50 g pack', 60, 90]]),
    p('snacks', 'kurkure', 'Kurkure Masala Munch', 'Crunchy corn puffs with a spicy masala kick.', '',
        [['SNACK-KURKURE-90', '90 g pack', 50, 80]]),
    p('snacks', 'dalmoth', 'Dalmoth', 'Spiced lentil and peanut mix, the classic drinks snack.', '',
        [['SNACK-DALMOTH-200', '200 g pack', 100, 40]]),
    p('snacks', 'pringles', 'Pringles Original', 'Stackable potato crisps in a can.', '',
        [['SNACK-PRINGLES-110', '110 g can', 350, 18]]),
    p('snacks', 'cheese-balls', 'Cheese Balls', 'Light, cheesy corn balls.', '',
        [['SNACK-CHEESEBALL-60', '60 g pack', 60, 2]]),

    // Hard drinks
    p('hard-drinks', 'old-durbar-reserve', 'Old Durbar Reserve', 'A smooth Nepali blended whisky with warm oak notes and a lingering finish. Enjoy responsibly.',
        'https://cheers.com.np/uploads/products/389329599067328761470117598242750366041.png',
        [['HARD-OLDDURBAR-750', '750 ml bottle', 2450, 15], ['HARD-OLDDURBAR-375', '375 ml bottle', 1300, 20]]),
    p('hard-drinks', 'khukri-xxx-rum', 'Khukri XXX Rum', 'A rich dark rum with caramel warmth and gentle spice, crafted in Nepal. Enjoy responsibly.',
        'https://bartenderspiritsawards.com/cont/competitionSubmissions/imagePot/BartenderSpiritsAwardsUS-01222024053904000000-65ae53d80f72a.jpg',
        [['HARD-KHUKRI-750', '750 ml bottle', 1725, 20], ['HARD-KHUKRI-375', '375 ml bottle', 900, 25]]),
    p('hard-drinks', '8848-vodka', '8848 Vodka', 'Premium Nepali vodka, clean and smooth.', '',
        [['HARD-8848-750', '750 ml bottle', 1850, 12]]),
    p('hard-drinks', 'ruslan-vodka', 'Ruslan Vodka', 'Popular Nepali vodka for mixing.', '',
        [['HARD-RUSLAN-750', '750 ml bottle', 1450, 18]]),
    p('hard-drinks', 'golden-oak', 'Golden Oak', 'Light Nepali whisky with a mellow finish.', '',
        [['HARD-GOLDENOAK-750', '750 ml bottle', 1600, 5]]),
    p('hard-drinks', 'signature-rare', 'Signature Rare', 'Blended whisky with a rich, rounded taste.', '',
        [['HARD-SIGNATURE-750', '750 ml bottle', 2950, 8]]),
];
