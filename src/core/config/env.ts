export interface ServiceUrls {
  omniClient: string;
  order: string;
  inventory: string;
  notification: string;
}

/**
 * Target URLs and configuration for k6 runs — strictly required from env (.env / CI).
 * No hardcoded host fallbacks (aligned with test-suites/src/config/environments.ts).
 */

export function getEnv(name: string, fallback?: string): string | undefined {
  // 1. Runtime CLI flag or CI environment (k6 __ENV)
  if (typeof __ENV !== 'undefined' && __ENV[name]) {
    const val = __ENV[name].trim();
    if (val) return val;
  }
  // 2. Injected from perf-suites/.env via dotenv at build time
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      const val = process.env[name].trim();
      if (val) return val;
    }
  } catch (e) {
    // k6 goja environment safety
  }
  return fallback;
}

export function requireEnv(name: string): string {
  const val = getEnv(name);
  if (!val) {
    throw new Error(
      `Missing required env: ${name}. Set it in perf-suites/.env or pass -e ${name}=value (see .env.sample).`
    );
  }
  return val;
}

export const ENV = {
  /** Optional label for reports/metadata */
  get TARGET_ENV(): string | undefined {
    return getEnv('TARGET_ENV');
  },

  /** Test parameters extracted from env */
  get DEFAULT_VUS(): number {
    return Number(getEnv('VUS', '10')) || 10;
  },
  get DEFAULT_DURATION(): string {
    return getEnv('DURATION', '30s')!;
  },
  get SCENARIO_FILTER(): string {
    return getEnv('SCENARIO') || getEnv('SCENARIOS') || 'all';
  },

  /**
   * Target URLs for runs — strictly required from env (.env / CI).
   * No hardcoded host fallbacks.
   */
  getBaseUrls(): ServiceUrls {
    const frontendUrl = getEnv('FRONTEND_URL') || getEnv('OMNI_CLIENT_URL');
    if (!frontendUrl) {
      throw new Error(
        `Missing required env: FRONTEND_URL. Set it in perf-suites/.env or pass -e FRONTEND_URL=value (see .env.sample).`
      );
    }

    return {
      omniClient: frontendUrl,
      order: requireEnv('ORDER_URL'),
      inventory: requireEnv('INVENTORY_URL'),
      notification: requireEnv('NOTIFICATION_URL'),
    };
  },
};
