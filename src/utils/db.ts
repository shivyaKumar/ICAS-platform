// utils/db.ts
import sql from 'mssql';

const config = {
  user: 'sa',
  password: 'P@$$w0rd@2025!!$$',
  server: 'LAPTOP-UV67L3QS', // machine name only
  database: 'icas',
  options: {
    instanceName: 'COBRA',      // your named instance as option
    encrypt: false,             // encryption false for local dev
    trustServerCertificate: true,
  },
};

// Reuse connection pool (optional enhancement for performance)
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}
