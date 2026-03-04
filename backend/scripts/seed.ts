import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import User model
import { User } from '../src/models';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/truuth_portal';

async function seed(): Promise<void> {
  console.log('Seeding database...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB\n');

    // Create test user
    const passwordHash = await bcrypt.hash('password123', 12);

    const testUser = await User.findOneAndUpdate(
      { username: 'testuser' },
      { username: 'testuser', passwordHash },
      { upsert: true, new: true }
    );

    console.log('Created test user:');
    console.log(`   ID: ${testUser._id}`);
    console.log(`   Username: ${testUser.username}`);
    console.log('');

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 12);

    const adminUser = await User.findOneAndUpdate(
      { username: 'admin' },
      { username: 'admin', passwordHash: adminPasswordHash },
      { upsert: true, new: true }
    );

    console.log('Created admin user:');
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log('');

    // Create ijaz users (ijaz, ijaz1 ... ijaz6)
    const ijazPasswordHash = await bcrypt.hash('password123', 12);
    const ijazUsers = ['ijaz', 'ijaz1', 'ijaz2', 'ijaz3', 'ijaz4', 'ijaz5', 'ijaz6'];

    for (const username of ijazUsers) {
      const user = await User.findOneAndUpdate(
        { username },
        { username, passwordHash: ijazPasswordHash },
        { upsert: true, new: true }
      );

      console.log(`Created user: ${user.username} (ID: ${user._id})`);
    }

    console.log('');
    console.log('===============================================');
    console.log('       DATABASE SEEDED SUCCESSFULLY!           ');
    console.log('===============================================');
    console.log('');
    console.log('Test Credentials:');
    console.log('  Username: testuser');
    console.log('  Password: password123');
    console.log('');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('Ijaz Users Credentials:');
    console.log('  Password (all): password123');
    console.log('');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
