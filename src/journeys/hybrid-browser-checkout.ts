// @ts-ignore - Ignore missing type declarations for k6/browser
import { browser } from 'k6/browser';
import { Options } from 'k6/options';
import { ENV } from '@core/config/env';

export const options: Options = {
  scenarios: {
    ui_load: {
      executor: 'constant-vus',
      vus: 2,
      duration: '10s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    browser_web_vital_lcp: ['p(90)<2000'],
  },
};

export default async function () {
  const page = await browser.newPage();
  
  try {
    await page.goto(ENV.getBaseUrls().omniClient);
    // await page.locator('button[data-testid="buy-btn"]').click();
    // await page.waitForNavigation();
  } finally {
    await page.close();
  }
}
