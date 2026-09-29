export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://bidsure_user:bidsure_secure_password@localhost:5432/bidsure_db',
  },
};
