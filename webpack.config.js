const path = require('path');

module.exports = {
  mode: 'production',
  context: path.join(__dirname, 'src'),
  entry: {
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
  target: 'web',
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
};
