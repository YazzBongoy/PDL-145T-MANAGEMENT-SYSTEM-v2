import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  // Cleanup any test data if needed
  console.log('✅ Teardown complete');
}

export default globalTeardown;
