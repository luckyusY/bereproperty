export const categories = [
  'Building Materials', 'Cloth', 'Decorations', 'Electrical & Lighting', 'Electronics & Telecom',
  'Finishing Materials', 'Furniture & Fixtures', 'Garden & Landscaping', 'HVAC & Ventilation',
  'Other', 'Plumbing & Water', 'Tools & Equipment', 'Automotive & Machinery',
];

export const slugify = value => value.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const money = value => `RWF ${new Intl.NumberFormat('en-US').format(value || 0)}`;
export const imageUrl = (id, width = 760) => id?.startsWith('http') ? id : `https://images.unsplash.com/${id || 'photo-1504307651254-35680f356dfd'}?auto=format&fit=crop&w=${width}&q=82`;
export const categoryImage = category => `/images/categories/${slugify(category)}.jpg`;

const seeds = [
  ['Makita 18V Cordless Drill Kit','Tools & Equipment',189000,'set',12,'Doxa Automotive & Machinery','Gasabo','photo-1504148455328-c376907d081c'],
  ['Portland Cement — 50 kg','Building Materials',12500,'bag',240,'BuildRight Rwanda','Kicukiro','photo-1513467655676-561b7d489a88'],
  ['Heavy Duty Wheelbarrow','Tools & Equipment',68000,'piece',8,'Kigali Hardware Hub','Nyarugenge','photo-1581578731548-c64695cc6952'],
  ['LED Panel Light 40W','Electrical & Lighting',24500,'piece',56,'Volt House Rwanda','Remera','photo-1507473885765-e6ed057f782c'],
  ['Premium Ceramic Floor Tiles','Finishing Materials',18500,'m²',90,'ESE Design & Build','Kimihurura','photo-1600607687939-ce8a6c25118c'],
  ['Submersible Water Pump 1HP','Plumbing & Water',215000,'piece',6,'AquaFlow Supplies','Gikondo','photo-1518770660439-4636190af475'],
  ['Angle Grinder 900W','Tools & Equipment',79000,'piece',23,'Doxa Automotive & Machinery','Gasabo','photo-1530124566582-a618bc2615dc'],
  ['Modern Pendant Light','Electrical & Lighting',96000,'piece',14,'Volt House Rwanda','Remera','photo-1507473885765-e6ed057f782c'],
  ['Workwear Cotton Twill','Cloth',18000,'meter',74,'Kigali Textile House','Nyarugenge','photo-1523381210434-271e8be1f52b'],
  ['Concrete Garden Planter','Decorations',45000,'piece',10,'Beta Garden Rwanda','Gasabo','photo-1490312278390-ab64016e0aa9'],
  ['PTZ Wi-Fi Security Camera','Electronics & Telecom',85000,'piece',18,'VI Connect Services','Nyarugenge','photo-1557324232-b8917d3c3dcb'],
  ['Oak Interior Door','Furniture & Fixtures',165000,'piece',9,'Kigali Joinery','Kicukiro','photo-1505693416388-ac5ce068fe85'],
  ['Garden Hose 30 m','Garden & Landscaping',28000,'roll',32,'Green Yard Supplies','Gasabo','photo-1416879595882-3373a0480b5b'],
  ['Split Air Conditioner 12000 BTU','HVAC & Ventilation',990000,'set',4,'Doxa Automotive & Machinery','Gasabo','photo-1631545806609-14e5a3f3bd02'],
  ['Labeling Paper Roll','Other',12000,'roll',30,'Toolbox Kigali','Gasabo','photo-1586953208448-b95a79798f07'],
];

export const demoProducts = seeds.map(([name, category, price, unit, stock, sellerName, district, image], index) => ({
  id: `demo-${index + 1}`,
  name,
  category,
  price,
  currency: 'RWF',
  unit,
  stock,
  rating: [4.8, 4.7, 4.9, 4.6][index % 4],
  reviewCount: [28, 19, 42, 14][index % 4],
  description: `Reliable ${category.toLowerCase()} for your next project. Contact the supplier to confirm availability, delivery, and bulk pricing.`,
  images: [{ url: imageUrl(image), publicId: '' }, { url: categoryImage(category), publicId: '' }],
  image: imageUrl(image),
  seller: { name: sellerName, slug: slugify(sellerName), province: 'Kigali City', district, phone: '+250 788 000 000', verified: index % 3 === 0 },
  store: { name: sellerName, slug: slugify(sellerName), province: 'Kigali City', district },
  refundPolicy: 'Contact seller for return terms',
}));
