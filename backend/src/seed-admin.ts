import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  const uri =
    'mongodb+srv://admin:C6xIzFO0lQyCDdCW@main.dzqmb8v.mongodb.net';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(); // Uses default database from URI
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({
      email: 'admin@bellavista.com',
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create admin user
    const adminUser = {
      name: 'Admin',
      email: 'admin@bellavista.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(adminUser);
    console.log('Admin user created successfully!');
    console.log('Email: admin@bellavista.com');
    console.log('Password: Admin123!');
    console.log('Inserted ID:', result.insertedId);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedAdmin();

