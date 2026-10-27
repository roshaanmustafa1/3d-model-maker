import { defineConfig } from '@playwright/test'
const output = process.env.QA_OUTPUT_DIR || './qa-reports/test-results'
export default defineConfig({
  testDir: './tests/qa/browser',
  timeout: 60000,
  expect: { timeout: 12000 },
  workers: 1,
  retries: 0,
  outputDir: `${output}/browser-artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/browser-results.json` }], ['html', { outputFolder: `${output}/browser-report`, open: 'never' }]],
  use: {
    baseURL: process.env.QA_BASE_URL || 'http://localhost:3000',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: process.env.QA_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
})
