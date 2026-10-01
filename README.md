# perf-suites

Domain-Driven **k6 Performance & Load Testing Framework** for the Omni-Suites microservice platform.

Built with **TypeScript**, **Grafana k6**, **Webpack**, and **DDD Principles**, featuring isolated microservice load tests, cross-service E2E user journeys, hybrid browser testing, and automated Discord reporting.

---

## 1. Architecture & Directory Layout

The project separates concerns by domain. Each microservice owns its API client and payloads, while cross-cutting utilities and cross-service journeys stay decoupled.

```text
perf-suites/
├── .github/workflows/
│   ├── perf-on-demand.yml           # On-demand CI run with open string scenario input
│   └── perf-nightly.yml             # Scheduled daily 21:00 UTC staging regression
├── src/
│   ├── core/                        # Shared framework core
│   │   ├── config/
│   │   │   └── env.ts               # Environment configuration (strict required URLs, zero fallbacks)
│   │   ├── data/                    # Shared fixture datasets & helpers
│   │   │   ├── test-items.json      # Product SKUs for load tests
│   │   │   ├── test-users.json      # Virtual customer accounts
│   │   │   └── index.ts             # Random data providers (getRandomItem, getRandomUser)
│   │   └── utils/
│   │       └── metrics.ts           # Custom k6 Trends, Counters, and Rates
│   ├── modules/                     # Domain-Driven Microservices
│   │   ├── order/                   # Order Service
│   │   │   ├── api.ts               # HTTP client (createOrder, listOrders)
│   │   │   ├── payloads.ts          # Dynamic payload generators
│   │   │   └── scenarios/           # Isolated component load tests
│   │   │       └── create-order.load.ts
│   │   ├── inventory/               # Inventory Service
│   │   │   ├── api.ts               # HTTP client (deductStock, listInventory)
│   │   │   └── scenarios/
│   │   │       └── deduct-stock.load.ts
│   │   └── notification/            # Notification Service
│   │       └── api.ts               # HTTP client (getNotifications, sendNotification)
│   ├── journeys/                    # Cross-Service Workflows
│   │   ├── checkout-flow.ts         # Full API chain: Inventory → Order → Notification
│   │   └── hybrid-browser-checkout.ts # UI load test using k6/browser
│   └── main.ts                      # Unified multi-scenario engine with dynamic __ENV filtering & handleSummary
├── dist/                            # Webpack-bundled k6 execution artifacts
├── .env.sample                      # Environment template
├── package.json                     # Scripts & dev dependencies
├── tsconfig.json                    # Path aliases (@core/*, @modules/*, @journeys/*)
└── webpack.config.js                # CommonJS bundler with dotenv & DefinePlugin
```

---

## 2. Configuration & Environment Variables

All target URLs are **required** from the environment. There are **zero hardcoded host fallbacks** in the codebase.

Copy the template to create your local `.env`:
```bash
cp .env.sample .env
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|---|---|---|---|
| `FRONTEND_URL` | **Yes** | Web application base URL | `https://frontend-svc.test-suites-poc.work.gd` |
| `ORDER_URL` | **Yes** | Order Service API base URL | `https://order-svc.test-suites-poc.work.gd` |
| `INVENTORY_URL` | **Yes** | Inventory Service API base URL | `https://inventory-svc.test-suites-poc.work.gd` |
| `NOTIFICATION_URL` | **Yes** | Notification Service API base URL | `https://notification-svc.test-suites-poc.work.gd` |
| `TARGET_ENV` | No | Metadata label for reports (e.g. `staging`) | `staging` |
| `SCENARIO` | No | Scenario(s) to execute (default: `all`) | `checkout_flow`, `order_create`, `inventory_deduct` |
| `VUS` | No | Virtual Users concurrency override | `20` |
| `DURATION` | No | Test duration override | `1m`, `30s` |

> [!NOTE]
> `.env` is loaded automatically at build time via `dotenv` and Webpack `DefinePlugin`. Any `-e KEY=VALUE` flag passed directly to `k6 run` overrides `.env` values dynamically.

---

## 3. Setup & Installation

### Prerequisites
1. **Node.js** (v18+) & **npm**
2. **Grafana k6** (v0.50+)
   * Windows (winget): `winget install k6`
   * Windows (choco): `choco install k6`
   * macOS (brew): `brew install k6`
   * Linux: `sudo gpg -k && ...` ([official guide](https://grafana.com/docs/k6/latest/set-up/install-k6/))

### Installation
```bash
# 1. Install dependencies
npm ci

# 2. Setup your local environment
cp .env.sample .env

# 3. Compile TypeScript into k6 distribution bundles
npm run build
```

---

## 4. Running Performance Tests Locally

### A. Run via NPM Scripts
```bash
npm run build              # Compile all TS entry points into dist/
npm test                   # Run multi-scenario suite (dist/main.js)
npm run test:checkout      # Run isolated checkout journey
npm run test:order         # Run isolated order creation test
npm run test:inventory     # Run isolated inventory deduction test
npm run test:browser       # Run hybrid browser UI load test
```

### B. Dynamic On-Demand Execution (`dist/main.js`)
The `main.js` engine reads `__ENV.SCENARIO` to execute specific workout routines without modifying code:

```bash
# Run ALL deployed microservice scenarios
k6 run dist/main.js

# Run ONLY the checkout journey
k6 run -e SCENARIO=checkout_flow dist/main.js

# Run ONLY the order creation scenario
k6 run -e SCENARIO=order_create dist/main.js

# Run multiple specific scenarios simultaneously
k6 run -e SCENARIO=order_create,inventory_deduct dist/main.js

# Override concurrency and duration on the fly
k6 run -e SCENARIO=checkout_flow -e VUS=25 -e DURATION=1m dist/main.js
```

---

## 5. How to Add a New Scenario (Future Features)

When a new feature or API is added to a microservice:

### Step 1: Add the API Client Call
In `src/modules/<service>/api.ts`:
```typescript
export function cancelOrder(orderId: string) {
  const url = `${ENV.getBaseUrls().order}/orders/${orderId}/cancel`;
  return http.post(url, JSON.stringify({ reason: 'customer_request' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Step 2: Register the Scenario Routine
In `src/main.ts`:
```typescript
// 1. Define the scenario function
export function runCancelOrder() {
  const res = cancelOrder('order_123');
  check(res, { 'order cancelled': (r) => r.status === 200 });
  sleep(1);
}

// 2. Add to scenarioCatalog
const scenarioCatalog: Record<string, Scenario> = {
  // ... existing scenarios
  cancel_order: {
    executor: 'constant-vus',
    vus: ENV.DEFAULT_VUS,
    duration: ENV.DEFAULT_DURATION,
    exec: 'runCancelOrder',
  },
};
```

### Step 3: Build & Execute On-Demand
```bash
npm run build
k6 run -e SCENARIO=cancel_order dist/main.js
```
The new scenario is immediately runnable locally, via GitHub Actions, and from Discord!

---

## 6. CI/CD Automation (GitHub Actions)

Two GitHub Actions workflows are provided in `.github/workflows/`:

| Workflow | Trigger | Description |
|---|---|---|
| **`perf-on-demand.yml`** | `workflow_dispatch` | Manual run with free-form text input for `scenario`, plus `vus` & `duration` overrides against `staging`. |
| **`perf-nightly.yml`** | Schedule (`0 21 * * *`) | Daily 21:00 UTC staging regression running `SCENARIO: all`. |

### Required GitHub Secrets & Variables (Environment: `staging`)
* **Variables:**
  * `FRONTEND_URL`
  * `ORDER_URL`
  * `INVENTORY_URL`
  * `NOTIFICATION_URL`
* **Secrets:**
  * `TEST_RESULT_HOOK_URL`: Webhook URL pointing to `omni-integration` (`https://hooks.test-suites-poc.work.gd/api/discord/test-results`).

### Metrics Reporting
Both workflows run k6 with native `handleSummary` export. At the end of the job, a post-run step extracts:
* **P95 Latency**
* **Total Requests**
* **Error Rate**
and posts the results to Omni-Integration via webhook.

---

## 7. Discord Bot Integration (`omni-integration`)

Team members can trigger k6 performance tests directly from Discord using the `/run-perf` slash command:

```text
/run-perf scenario:checkout_flow vus:20 duration:1m
/run-perf scenario:order_create
/run-perf scenario:all
```

### Slash Command Options
* `scenario` *(String, required)*: Open text input (`all`, `checkout_flow`, `order_create`, `inventory_deduct`, `notification_list`).
* `vus` *(String, optional)*: Virtual Users count override.
* `duration` *(String, optional)*: Test duration override (e.g. `30s`, `2m`).

### Results Notification
Upon test completion, the bot posts a rich performance embed directly into the `#test-releases` channel:

```text
⚡ Performance Test PASSED — CHECKOUT_FLOW
k6 performance execution completed on staging.

Scenario:      checkout_flow
Status:        PASSED
P95 Latency:   215 ms
Total Reqs:    1,840
Error Rate:    0.00%
Config:        20 VUs · 1m
Branch/Commit: main (a1b2c3d)
GitHub Run:    #42
```
