const { db, schema } = require('./index');
const { hashPassword } = require('../utils/password');
const mockData = require('../data/store');

async function seed() {
  if (!db) {
    console.error('❌ Cannot run seed: DATABASE_URL is not set or DB connection failed.');
    process.exit(1);
  }

  console.log('🌱 Starting Neon database seeding...');

  try {
    // 1. Seed Users
    console.log('Inserting default admin users with Argon2 hashes...');
    for (const user of mockData.users) {
      const hashedPassword = await hashPassword(user.password);
      await db.insert(schema.users).values({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
      }).onConflictDoNothing();
    }

    // 2. Seed UMKMs
    console.log('Inserting initial UMKM records...');
    for (const umkm of mockData.umkms) {
      await db.insert(schema.umkms).values({
        id: umkm.id,
        name: umkm.name,
        owner: umkm.owner,
        category: umkm.category,
        address: umkm.address,
        phone: umkm.phone,
        whatsapp: umkm.whatsapp,
        gmapsUrl: umkm.gmapsUrl,
        gmapsEmbed: umkm.gmapsEmbed,
        description: umkm.description,
        landingText: umkm.landingText,
        profileImage: umkm.profileImage,
        bannerImage: umkm.bannerImage,
        rating: umkm.rating,
        reviewCount: umkm.reviewCount,
        certifications: ['Halal MUI', 'Unggulan Desa'],
        latitude: '-6.890000',
        longitude: '110.145000',
      }).onConflictDoNothing();
    }

    // 3. Seed Products
    console.log('Inserting product catalog records...');
    for (const prod of mockData.products) {
      await db.insert(schema.products).values({
        id: prod.id,
        umkmId: prod.umkmId,
        name: prod.name,
        price: prod.price,
        unit: prod.unit,
        description: prod.description,
        image: prod.image,
      }).onConflictDoNothing();
    }

    // 4. Seed Feedbacks
    console.log('Inserting feedback records...');
    for (const fb of mockData.feedbacks) {
      await db.insert(schema.feedbacks).values({
        id: fb.id,
        name: fb.name,
        email: fb.email,
        message: fb.message,
        createdAt: new Date(fb.createdAt),
      }).onConflictDoNothing();
    }

    // 5. Seed Dynamic Content
    console.log('Inserting dynamic site content...');
    await db.insert(schema.dynamicContent).values(mockData.dynamicContent).onConflictDoNothing();

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
