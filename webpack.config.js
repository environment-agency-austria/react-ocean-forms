const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * The source path
 */
const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        include: srcPath,
        exclude: /(node_modules|bower_components|build|coverage)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        // This loader is used to transpile the .ts and .tsx files
        // After that to js the output is transpiled
        // using babel-loader.
        test: /\.(tsx?)$/,
        include: srcPath,
        exclude: /(node_modules|bower_components|build|coverage)/,
        use: [
          'babel-loader', {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(srcPath, 'tsconfig.build.json'),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
  },
  externals: {
    react: 'commonjs react',
  },
  plugins: [
    new CleanWebpackPlugin(['build/*']),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
  ],
};
