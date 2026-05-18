import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  const apiUrl = process.env.API_URL || 'http://localhost:8002';
  
  // Wait for backend to be ready
  const maxRetries = 30;
  const delay = 1000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'healthy') {
          console.log('✅ Backend is healthy and ready');
          break;
        }
      }
    } catch (e) {
      // Backend not ready yet
    }
    
    if (i === maxRetries - 1) {
      console.warn('⚠️ Backend health check timed out, continuing anyway...');
    } else {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
