import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';
import Store from './models/Store.js';
import Order from './models/Order.js';
import Cart from './models/Cart.js';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 5000);
const categories = ['Building Materials', 'Cloth', 'Decorations', 'Electrical & Lighting', 'Electronics & Telecom', 'Finishing Materials', 'Furniture & Fixtures', 'Garden & Landscaping', 'HVAC & Ventilation', 'Other', 'Plumbing & Water', 'Tools & Equipment', 'Automotive & Machinery'];
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const cookieName = 'toolbay_session';
const isCloudinaryReady = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

if (isCloudinaryReady) {
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
}
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const uploadImage = buffer => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream({ folder: 'toolbay/products', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1400, height: 1200, crop: 'limit', quality: 'auto' }] }, (error, result) => error ? reject(error) : resolve(result)).end(buffer);
});

const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone });
const tokenFor = user => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const setSession = (res, user) => res.cookie(cookieName, tokenFor(user), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.COOKIE_SAME_SITE || 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
const auth = async (req, res, next) => {
  try {
    const token = req.cookies[cookieName];
    if (!token) return res.status(401).json({ error: 'Sign in is required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Session is no longer valid' });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Please sign in again' }); }
};
const role = expected => (req, res, next) => req.user?.role === expected ? next() : res.status(403).json({ error: `${expected} account required` });
const sellerStore = async (req, res, next) => {
  const store = await Store.findOne({ owner: req.user._id, isActive: true });
  if (!store) return res.status(404).json({ error: 'Seller store not found' });
  req.store = store;
  next();
};
const productCard = p => ({ ...p, id: p._id, store: p.store, seller: p.store && typeof p.store === 'object' ? { name: p.store.name, slug: p.store.slug, province: p.store.province, district: p.store.district, phone: p.store.phone, verified: p.store.verified } : undefined, image: p.images?.[0]?.url || '' });
const slugify = value => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'toolbay-api', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', uploads: isCloudinaryReady ? 'configured' : 'not-configured' }));
app.get('/api/categories', (_req, res) => res.json({ items: categories }));
app.get('/api/products/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Product not found' });
  const doc = await Product.findOne({ _id: req.params.id, isActive: true }).populate('store', 'name slug province district phone verified').lean();
  if (!doc) return res.status(404).json({ error: 'Product not found' });
  res.json(productCard(doc));
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role: accountRole, phone = '', store: storeInput } = req.body;
    if (!name || !email || !password || !['buyer', 'seller'].includes(accountRole)) return res.status(400).json({ error: 'Name, email, password, and buyer/seller account type are required' });
    if (String(password).length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
    if (accountRole === 'seller' && (!storeInput?.name || !storeInput?.province)) return res.status(400).json({ error: 'Store name and province are required for seller accounts' });
    const hash = await bcrypt.hash(password, 12);
    let user, store = null;
    if (accountRole === 'seller') {
      const base = slugify(storeInput.name) || 'store';
      let slug = base;
      for (let suffix = 1; await Store.exists({ slug }); suffix += 1) slug = `${base}-${suffix}`;
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          [user] = await User.create([{ name, email: String(email).toLowerCase().trim(), passwordHash: hash, role: accountRole, phone }], { session });
          [store] = await Store.create([{ owner: user._id, name: storeInput.name, slug, category: storeInput.category || 'Retailer', phone: phone || storeInput.phone || '', province: storeInput.province, district: storeInput.district || '', description: storeInput.description || '' }], { session });
        });
      } finally { await session.endSession(); }
    } else user = await User.create({ name, email: String(email).toLowerCase().trim(), passwordHash: hash, role: accountRole, phone });
    setSession(res, user);
    res.status(201).json({ user: publicUser(user), store });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'That email is already registered' });
    res.status(400).json({ error: 'Could not create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect' });
  const store = user.role === 'seller' ? await Store.findOne({ owner: user._id }).lean() : null;
  setSession(res, user);
  res.json({ user: publicUser(user), store });
});
app.post('/api/auth/logout', (_req, res) => res.clearCookie(cookieName, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.COOKIE_SAME_SITE || 'lax', path: '/' }).json({ ok: true }));
app.get('/api/auth/me', auth, async (req, res) => {
  const store = req.user.role === 'seller' ? await Store.findOne({ owner: req.user._id }).lean() : null;
  res.json({ user: publicUser(req.user), store });
});

app.get('/api/products', async (req, res) => {
  try {
    const { q, category, sort = 'newest', page = '1', limit = '24', province, district, minPrice, maxPrice } = req.query;
    const normalizedQuery = typeof q === 'string' ? q.trim().replace(/\s+/g, ' ') : '';
    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (province || district) {
      const storeFilter = {};
      if (province) storeFilter.province = province;
      if (district) storeFilter.district = new RegExp(`^${String(district).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      filter.store = { $in: await Store.find(storeFilter).distinct('_id') };
    }
    if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };
    if (normalizedQuery) {
      const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const supplierIds = await Store.find({ name: new RegExp(escapedQuery, 'i'), isActive: true }).distinct('_id');
      filter.$or = [{ $text: { $search: normalizedQuery } }, { store: { $in: supplierIds } }];
    }
    const safeLimit = Math.max(1, Math.min(48, Number(limit) || 24));
    const currentPage = Math.max(1, Number(page) || 1);
    let query = Product.find(filter).populate('store', 'name slug province district phone verified');
    if (normalizedQuery) query = query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
    else if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });
    const [docs, total] = await Promise.all([query.skip((currentPage - 1) * safeLimit).limit(safeLimit).lean(), Product.countDocuments(filter)]);
    res.json({ items: docs.map(productCard), total, page: currentPage, pages: Math.ceil(total / safeLimit) });
  } catch { res.status(500).json({ error: 'Could not load products' }); }
});
app.get('/api/stores/:slug', async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, isActive: true }).select('-owner').lean();
  if (!store) return res.status(404).json({ error: 'Store not found' });
  const [products, productCount] = await Promise.all([Product.find({ store: store._id, isActive: true }).sort({ createdAt: -1 }).limit(48).lean(), Product.countDocuments({ store: store._id, isActive: true })]);
  res.json({ store, products: products.map(productCard), productCount });
});

const requireUploadConfig = (req, res, next) => isCloudinaryReady ? next() : res.status(503).json({ error: 'Product image upload is not configured on this server' });
app.post('/api/seller/products', auth, role('seller'), sellerStore, requireUploadConfig, upload.array('images', 8), async (req, res) => {
  try {
    const { name, description, category, price, unit, stock } = req.body;
    if (!name || !categories.includes(category) || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ error: 'Name, valid category, and non-negative price are required' });
    const uploaded = await Promise.all((req.files || []).map(file => uploadImage(file.buffer)));
    const images = uploaded.map(file => ({ url: file.secure_url, publicId: file.public_id }));
    const product = await Product.create({ store: req.store._id, name, description, category, price: Number(price), unit: unit || 'piece', stock: Number(stock || 0), images });
    res.status(201).json(product);
  } catch { res.status(400).json({ error: 'Could not create product' }); }
});
app.patch('/api/seller/products/:id', auth, role('seller'), sellerStore, async (req, res) => {
  const allowed = ['name', 'description', 'category', 'price', 'unit', 'stock', 'isActive'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (update.category && !categories.includes(update.category)) return res.status(400).json({ error: 'Invalid product category' });
  const product = await Product.findOneAndUpdate({ _id: req.params.id, store: req.store._id }, update, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ error: 'Product not found in your store' });
  res.json(product);
});
app.delete('/api/seller/products/:id', auth, role('seller'), sellerStore, async (req, res) => {
  const product = await Product.findOneAndUpdate({ _id: req.params.id, store: req.store._id }, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found in your store' });
  if (isCloudinaryReady) await Promise.all(product.images.map(image => cloudinary.uploader.destroy(image.publicId).catch(() => null)));
  res.json({ ok: true });
});
app.get('/api/seller/products', auth, role('seller'), sellerStore, async (req, res) => res.json({ items: await Product.find({ store: req.store._id }).sort({ createdAt: -1 }).lean() }));

const populatedCart = async userId => {
  const cart = await Cart.findOne({ user: userId }).populate({ path: 'items.product', populate: { path: 'store', select: 'name slug province district phone verified' } }).lean();
  return { items: (cart?.items || []).filter(item => item.product?.isActive).map(item => ({ product: productCard(item.product), quantity: item.quantity })) };
};
app.get('/api/cart', auth, role('buyer'), async (req, res) => res.json(await populatedCart(req.user._id)));
app.put('/api/cart', auth, role('buyer'), async (req, res) => {
  const input = Array.isArray(req.body.items) ? req.body.items : [];
  const quantities = new Map();
  for (const item of input) {
    if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 999) return res.status(400).json({ error: 'Cart items are invalid' });
    quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + Number(item.quantity));
  }
  const activeIds = await Product.find({ _id: { $in: [...quantities.keys()] }, isActive: true }).distinct('_id');
  const items = activeIds.map(product => ({ product, quantity: Math.min(999, quantities.get(String(product))) }));
  await Cart.findOneAndUpdate({ user: req.user._id }, { user: req.user._id, items }, { upsert: true, new: true, runValidators: true });
  res.json(await populatedCart(req.user._id));
});
app.post('/api/cart/merge', auth, role('buyer'), async (req, res) => {
  const existing = await Cart.findOne({ user: req.user._id }).lean();
  const merged = new Map((existing?.items || []).map(item => [String(item.product), item.quantity]));
  for (const item of Array.isArray(req.body.items) ? req.body.items : []) {
    if (mongoose.isValidObjectId(item.productId) && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0) merged.set(String(item.productId), Math.min(999, (merged.get(String(item.productId)) || 0) + Number(item.quantity)));
  }
  const products = await Product.find({ _id: { $in: [...merged.keys()] }, isActive: true }).select('_id stock').lean();
  const items = products.filter(product => product.stock > 0).map(product => ({ product: product._id, quantity: Math.min(product.stock, merged.get(String(product._id))) }));
  await Cart.findOneAndUpdate({ user: req.user._id }, { user: req.user._id, items }, { upsert: true, new: true, runValidators: true });
  res.json(await populatedCart(req.user._id));
});

app.post('/api/orders', auth, role('buyer'), async (req, res) => {
  const { items, delivery } = req.body;
  if (!Array.isArray(items) || !items.length || !delivery?.province || !delivery?.district) return res.status(400).json({ error: 'Add items and delivery province/district to place an order request' });
  const quantities = new Map();
  for (const item of items) {
    if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 999) return res.status(400).json({ error: 'One or more basket items are invalid' });
    quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + Number(item.quantity));
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, isActive: true }).populate('store', 'name slug');
  if (products.length !== quantities.size) return res.status(409).json({ error: 'A basket product is no longer available' });
  const grouped = new Map();
  for (const p of products) {
    const quantity = quantities.get(String(p._id));
    if (!p.store || p.stock < quantity) return res.status(409).json({ error: `${p.name} does not have enough stock` });
    const key = String(p.store._id);
    if (!grouped.has(key)) grouped.set(key, { store: p.store._id, items: [], subtotal: 0 });
    const group = grouped.get(key);
    group.items.push({ product: p._id, name: p.name, image: p.images[0]?.url || '', unit: p.unit, unitPrice: p.price, quantity });
    group.subtotal += p.price * quantity;
  }
  const session = await mongoose.startSession();
  let savedOrders = [];
  try {
    await session.withTransaction(async () => {
      const orders = [];
      for (const group of grouped.values()) {
        const [order] = await Order.create([{
          orderNumber: `TB-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          buyer: req.user._id, store: group.store, items: group.items,
          delivery: { province: delivery.province, district: delivery.district, address: delivery.address || '', notes: delivery.notes || '', phone: req.user.phone || '' },
          subtotal: group.subtotal, paymentStatus: 'pending_manual', status: 'requested',
        }], { session });
        orders.push(order);
      }
      savedOrders = orders;
    });
    res.status(201).json({ orders: savedOrders });
  } catch { res.status(500).json({ error: 'Could not save all seller order requests' }); }
  finally { await session.endSession(); }
});
app.get('/api/account/orders', auth, role('buyer'), async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate('store', 'name slug phone').sort({ createdAt: -1 }).lean();
  res.json({ items: orders });
});
app.get('/api/seller/orders', auth, role('seller'), sellerStore, async (req, res) => {
  const orders = await Order.find({ store: req.store._id }).populate('buyer', 'name email phone').sort({ createdAt: -1 }).lean();
  res.json({ items: orders });
});
app.patch('/api/seller/orders/:id', auth, role('seller'), sellerStore, async (req, res) => {
  if (!['accepted', 'rejected'].includes(req.body.status)) return res.status(400).json({ error: 'Order status must be accepted or rejected' });
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: req.params.id, store: req.store._id, status: 'requested' }).session(session);
      if (!order) throw Object.assign(new Error('Order not found or already handled'), { status: 404 });
      if (req.body.status === 'accepted') {
        for (const item of order.items) {
          const update = await Product.updateOne({ _id: item.product, store: req.store._id, isActive: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { session });
          if (!update.modifiedCount) throw Object.assign(new Error(`${item.name} no longer has enough stock`), { status: 409 });
        }
      }
      order.status = req.body.status;
      await order.save({ session });
      result = order;
    });
    res.json({ order: result });
  } catch (error) { res.status(error.status || 500).json({ error: error.message || 'Could not update order' }); }
  finally { await session.endSession(); }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 8 MB or smaller' : error.message });
  res.status(500).json({ error: 'Unexpected server error' });
});

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Set MONGODB_URI and JWT_SECRET in the server .env before starting the API.');
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`Toolbay API listening on ${port}`));
}).catch(error => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});
