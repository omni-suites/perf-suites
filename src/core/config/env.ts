export const ENV = {
  // k6 provides __ENV which allows us to read environment variables passed via CLI (e.g. k6 run -e TARGET_ENV=staging)
  TARGET_ENV: __ENV.TARGET_ENV || 'local',

  getBaseUrls() {
    switch (this.TARGET_ENV) {
      case 'staging':
        return {
          omniClient: 'https://omni-client.test-suites-poc.work.gd',
          order: 'https://order.test-suites-poc.work.gd',
          inventory: 'https://inventory.test-suites-poc.work.gd',
          notification: 'https://notification.test-suites-poc.work.gd',
        };
      case 'dev':
        return {
          omniClient: 'http://localhost:5173', // or actual dev URL
          order: 'http://localhost:3000',
          inventory: 'http://localhost:3001',
          notification: 'http://localhost:3002',
        };
      default: // local
        return {
          omniClient: 'http://localhost:5173',
          order: 'http://localhost:3000',
          inventory: 'http://localhost:3001',
          notification: 'http://localhost:3002',
        };
    }
  }
};
