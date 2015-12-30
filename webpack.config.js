/* eslint no-var: 0 */

var webpack = require('webpack');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['', '.js'],
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
