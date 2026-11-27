import 'dotenv/config';
import { parseEnv } from '@neon/env';
import neonConfig from '../../neon.js';

// Validate Neon-managed Postgres env vars against neon.ts
const neonEnv = parseEnv(neonConfig, ['DATABASE_URL']);

export const env = {
  databaseUrl: neonEnv.postgres.databaseUrl,
  neonBranch: process.env.NEON_BRANCH || 'production',
  jwtSecret: process.env.JWT_SECRET || 'cocolis-dev-jwt-secret',
  apiPort: Number(process.env.API_PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};
