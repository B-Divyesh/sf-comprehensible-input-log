import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run build && npm run preview -- --host 127.0.0.1', port: 4173, reuseExistingServer: true },
  projects: [
    { name: 'chromium', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
