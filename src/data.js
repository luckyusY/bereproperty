export const categories = [
  'Building Materials', 'Cloth', 'Decorations', 'Electrical & Lighting', 'Electronics & Telecom',
  'Finishing Materials', 'Furniture & Fixtures', 'Garden & Landscaping', 'HVAC & Ventilation',
  'Other', 'Plumbing & Water', 'Tools & Equipment', 'Automotive & Machinery',
];

export const slugify = value => value.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const money = value => `RWF ${new Intl.NumberFormat('en-US').format(value || 0)}`;
export const imageUrl = (id, width = 760) => id?.startsWith('http') || id?.startsWith('/') ? id : `https://images.unsplash.com/${id || 'photo-1504307651254-35680f356dfd'}?auto=format&fit=crop&w=${width}&q=82`;
export const categoryImage = category => `/images/categories/${slugify(category)}.jpg`;
export const whatsappUrl = (phone, text) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

const bere = { name: 'Bere 1', slug: 'bere-1', phone: '+250 780 675 812', verified: false };
const sofaNote = 'Seven-seat sofa set. Call or WhatsApp Bere 1 to confirm the set layout, fabric and delivery.';

// Sample listings supplied by Bere 1 (photos in public/images/products). Stock counts are placeholders and
// ratings stay empty until buyers leave reviews. `focus` is the object-position used when a photo is cropped.
const seeds = [
  { id: 'bere-bed', name: 'Upholstered Bed — 1.6 m × 2 m', price: 250000, meta: '1.6 m × 2 m', photos: ['bed-upholstered'], focus: '50% 64%',
    description: 'Bed, 1.6 m × 2 m, with a panelled upholstered headboard and footboard. Call or WhatsApp Bere 1 to confirm fabric colour and delivery.',
    specs: [['Bed size', '1.6 m × 2 m']] },
  { id: 'bere-office-table', name: 'Office Table', price: 150000, meta: '1.20 × 0.60 × 0.80 m', photos: ['office-table'], focus: '50% 55%',
    description: 'Office table with a three-drawer pedestal. Call or WhatsApp Bere 1 to confirm finish and delivery.',
    specs: [['Length', '1.20 m'], ['Width', '0.60 m'], ['Height', '0.80 m']] },
  { id: 'bere-tv-stand', name: 'TV Stand', price: 150000, meta: 'Shelves · 2 drawers', photos: ['tv-stand'], focus: '40% 62%',
    description: 'TV stand with a tall shelving side, an open media shelf and two drawers. Call or WhatsApp Bere 1 to confirm size and delivery.',
    specs: [] },
  { id: 'bere-gas-stand', name: 'Gas Stand Cabinet', price: 110000, meta: '1.20 × 0.40 × 0.80 m', photos: ['gas-stand-cabinet', 'gas-stand-cooker'], focus: '45% 55%',
    description: 'Kitchen gas stand cabinet (akabati ka gas). Call or WhatsApp Bere 1 to confirm finish and delivery.',
    specs: [['Length', '1.20 m'], ['Width', '0.40 m'], ['Height', '0.80 m']] },
  { id: 'bere-sofa-black', name: '7-Seater Sofa Set — Black', price: 700000, meta: '7 seats · Black', photos: ['sofa-black'], focus: '50% 55%', description: sofaNote, specs: [['Seats', '7'], ['Colour', 'Black']] },
  { id: 'bere-sofa-blue', name: '7-Seater Sofa Set — Blue', price: 600000, meta: '7 seats · Blue', photos: ['sofa-blue'], focus: '50% 55%', description: sofaNote, specs: [['Seats', '7'], ['Colour', 'Blue']] },
  { id: 'bere-sofa-brown', name: '7-Seater Sofa Set — Brown', price: 600000, meta: '7 seats · Brown', photos: ['sofa-brown'], focus: '50% 60%', description: sofaNote, specs: [['Seats', '7'], ['Colour', 'Brown']] },
  { id: 'bere-sofa-green', name: '7-Seater Sofa Set — Green', price: 700000, meta: '7 seats · Green', photos: ['sofa-green'], focus: '50% 55%', description: sofaNote, specs: [['Seats', '7'], ['Colour', 'Green']] },
  { id: 'bere-sofa-white', name: '7-Seater Sofa Set — White', price: 1000000, meta: '7 seats · White', photos: ['sofa-white'], focus: '50% 52%', description: sofaNote, specs: [['Seats', '7'], ['Colour', 'White']] },
  { id: 'bere-wardrobe-brown', name: 'Wardrobe — Brown', price: 400000, meta: '1.8 × 0.60 × 2 m', photos: ['wardrobe-brown'], focus: '50% 40%',
    description: 'Three-door wardrobe with a centre mirror, two drawers and key locks. Call or WhatsApp Bere 1 to confirm finish and delivery.',
    specs: [['Size', '1.8 m × 0.60 m × 2 m'], ['Colour', 'Brown']] },
  { id: 'bere-wardrobe-white', name: 'Wardrobe — White', price: 400000, meta: '1.8 × 0.60 × 2 m', photos: ['wardrobe-white'], focus: '50% 38%',
    description: 'Wardrobe with a mirrored door, two drawers and black handles. Call or WhatsApp Bere 1 to confirm finish and delivery.',
    specs: [['Size', '1.8 m × 0.60 m × 2 m'], ['Colour', 'White']] },
];

export const demoProducts = seeds.map(({ photos, focus, ...item }) => {
  const urls = photos.map(file => `/images/products/${file}.jpg`);
  return {
    category: 'Furniture & Fixtures',
    currency: 'RWF',
    unit: 'piece',
    stock: 10,
    rating: 0,
    reviewCount: 0,
    images: urls.map(url => ({ url, publicId: '' })),
    image: urls[0],
    imageFocus: focus,
    seller: { ...bere },
    store: { ...bere },
    refundPolicy: 'Contact seller for return terms',
    ...item,
  };
});
