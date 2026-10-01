const path = require('path');

module.exports = {
  mode: 'production',
  context: path.join(__dirname, 'src'),
  entry: {
    'checkout-flow': './journeys/checkout-flow.ts'
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
  // Externalize k6 built-in modules so webpack doesn't try to bundle them
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
};
