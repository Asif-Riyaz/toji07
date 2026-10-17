const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './netlify/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
