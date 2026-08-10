const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  JWT_SECRET: z.string().default('korowelang_kulon_super_secret_jwt_key_2026'),
  DATABASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);
  
  if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'korowelang_kulon_super_secret_jwt_key_2026') {
    console.warn('⚠️ WARNING [SECURITY]: JWT_SECRET menggunakan key default pada mode produksi. Disarankan menggantinya di .env!');
  }
} catch (error) {
  console.error('❌ Environment Variable Validation Error:', error.errors || error.message);
  process.exit(1);
}

module.exports = env;
