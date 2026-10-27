import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_NAME?.trim() || !ADMIN_EMAIL?.trim() || !ADMIN_PASSWORD) {
  console.error('Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in the server environment.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 16) {
  console.error('ADMIN_PASSWORD must be at least 16 characters.');
  process.exit(1);
}
if (Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) {
  console.error('ADMIN_PASSWORD must be 72 UTF-8 bytes or fewer.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  if (mongoose.connection.name !== 'bereproperty') throw new Error(`Refusing to seed an admin into ${mongoose.connection.name}; MONGODB_URI must select the bereproperty database.`);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing?.role === 'admin') throw new Error('This account is already an admin. No changes were made.');
  if (await User.exists({ role: 'admin' })) throw new Error('An admin account already exists. No additional admin was created.');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  if (existing) {
    existing.name = ADMIN_NAME.trim();
    existing.passwordHash = passwordHash;
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
  } else {
    await User.create({ name: ADMIN_NAME.trim(), email, passwordHash, role: 'admin', isActive: true });
  }
  console.log(`BereProperty admin account ready for ${email}. Remove ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD from the environment now.`);
} catch (error) {
  console.error(error.message || 'Admin setup failed.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
