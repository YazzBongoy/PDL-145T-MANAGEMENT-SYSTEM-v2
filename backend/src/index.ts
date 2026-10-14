import { app } from './app.js';
import { prisma } from './prisma.js';
import { config } from './config/env.js';

// Server bootstrap only. The Express app and the Prisma client live in
// ./app.ts and ./prisma.ts respectively so they can be imported without
// side effects (tests, scripts). Keep this module free of shared state.

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`API endpoints available at http://localhost:${config.port}/api/`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

startServer();

export { app, prisma };
