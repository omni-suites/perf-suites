// @ts-ignore - Ignore missing type declarations for k6/browser
import { browser } from 'k6/browser';
import { Options } from 'k6/options';
import { ENV } from '@core/config/env';

export const options: Options = {
  scenarios: {
    ui_load: {
      executor: 'constant-vus',
      vus: Number(__ENV.BROWSER_VUS) || 2,
      duration: __ENV.BROWSER_DURATION || '10s',
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
  } finally {
    await page.close();
  }
}
