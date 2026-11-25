// All UI text. Screens use t('key'), never hard-coded strings.
// {name} placeholders are filled by t('key', { name: 'value' }).
export const en = {
  appName: 'RaksiChaiyo',
  tagline: 'Drinks, snacks & good moments',
  location: 'Nepalgunj, Nepal',

  'common.retry': 'Try again',
  'common.error': 'Something went wrong',
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.save': 'Save',

  'home.eyebrow': 'DELIVERED IN NEPALGUNJ',
  'home.title': 'What are we\nsipping today?',
  'home.deliveryPill': 'Delivering now',
  'home.responsible': 'Alcohol is sold only to customers aged 18 or above. Please drink responsibly.',
  'home.empty': 'No categories yet',

  'category.eyebrow': 'OUR PICKS',
  'category.items': '{count} items',
  'category.empty': 'Nothing in this category yet',
  'category.ageTag': '18+ · Enjoy responsibly',

  'product.outOfStock': 'Out of stock',
  'product.inStock': 'In stock',
  'product.lowStock': 'Only {count} left',
  'product.size': 'Size',
  'product.about': 'About this drink',
  'product.alcoholNote': '18+ only. Please drink responsibly.',
  'product.addToCart': 'Add to cart',
  'product.buyNow': 'Buy now',
  'product.added': '{name} added to cart',
  'product.maxReached': 'Only {count} in stock',

  'cart.title': 'Your cart',
  'cart.empty': 'Your cart is empty',
  'cart.emptyHint': 'Add something chilled to get started.',
  'cart.browse': 'Browse products',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Checkout',
  'cart.remove': 'Remove',
  'cart.label': 'Cart with {count} items',
  'cart.feeNote': 'Delivery fee is added at checkout.',

  'age.eyebrow': 'AGE CONFIRMATION',
  'age.title': 'Are you 18 or older?',
  'age.body': 'You must be of legal drinking age to view and buy alcohol.',
  'age.confirm': "Yes, I'm 18+",
  'age.decline': 'Not now',

  'error.network': 'Cannot reach the server. Check your connection.',
  'error.timeout': 'The server is taking too long. Try again.',
} as const;

export type StringKey = keyof typeof en;
