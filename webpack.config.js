const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load perf-suites/.env into build environment (matching test-suites pattern)
const envResult = dotenv.config({ path: path.resolve(__dirname, '.env') });
const envVars = envResult.parsed || {};

// Map env variables for Webpack DefinePlugin
const envKeys = Object.keys(envVars).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(envVars[next]);
  return prev;
}, {});

module.exports = {
  mode: 'production',
  context: path.join(__dirname, 'src'),
  entry: {
    'main': './main.ts',
    'checkout-flow': './journeys/checkout-flow.ts',
    'hybrid-browser-checkout': './journeys/hybrid-browser-checkout.ts',
    'create-order.load': './modules/order/scenarios/create-order.load.ts',
    'deduct-stock.load': './modules/inventory/scenarios/deduct-stock.load.ts',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@journeys': path.resolve(__dirname, 'src/journeys')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(envKeys),
  ],
  target: 'web',
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
};
