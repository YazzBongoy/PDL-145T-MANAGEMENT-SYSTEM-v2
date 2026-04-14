/**
 * Jest global teardown file
 * Runs once after all tests
 */
export default async function globalTeardown() {
    // Add cleanup logic here (e.g., close database connections)
    console.log('Global Jest teardown completed');
}
