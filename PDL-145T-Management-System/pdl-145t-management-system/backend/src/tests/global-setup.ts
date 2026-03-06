/**
 * Jest global setup file
 * Runs once before all tests
 */

import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: path.join(process.cwd(), '.env.test') });

  // Additional setup can be added here (e.g., database migrations)
  console.log('Global Jest setup completed');
}
