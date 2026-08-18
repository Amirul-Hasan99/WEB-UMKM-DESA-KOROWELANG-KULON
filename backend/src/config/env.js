const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  
  // JWT Secret — required always (no insecure default in production)
  JWT_SECRET: z.string().min(16, { message: 'JWT_SECRET minimal 16 karakter.' }).optional(),
  JWT_EXPIRES_IN: z.string().default('1d'),
  
  // Database — required in production
  DATABASE_URL: z.string().optional(),
  
  // CORS
  FRONTEND_URL: z.string().optional(),

  // Cloudinary (optional — gracefully degraded if not set)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);

  // Production safety checks
  if (env.NODE_ENV === 'production') {
    if (!env.DATABASE_URL) {
      console.error('❌ FATAL [PRODUCTION]: DATABASE_URL environment variable is not set!');
      console.error('   Set DATABASE_URL in your Vercel/production environment variables.');
      process.exit(1);
    }
    if (!env.JWT_SECRET) {
      console.error('❌ FATAL [PRODUCTION]: JWT_SECRET environment variable is not set!');
      console.error('   Set JWT_SECRET in your Vercel/production environment variables.');
      process.exit(1);
    }
    if (!env.CLOUDINARY_CLOUD_NAME) {
      console.warn('⚠️  WARNING [PRODUCTION]: CLOUDINARY_CLOUD_NAME not set. Image uploads will return base64 data URLs instead of CDN URLs.');
    }
  }

  if (env.NODE_ENV === 'development' && !env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL tidak dikonfigurasi. Backend berjalan tanpa database — semua CRUD akan gagal.');
    console.warn('   Tambahkan DATABASE_URL di backend/.env');
  }
} catch (error) {
  console.error('❌ Environment Variable Validation Error:');
  if (error.errors) {
    error.errors.forEach(e => console.error(`   - ${e.path.join('.')}: ${e.message}`));
  } else {
    console.error('  ', error.message);
  }
  process.exit(1);
}

module.exports = env;
