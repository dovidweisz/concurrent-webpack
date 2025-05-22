const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const __CCWP_BUILD_OPTIONS = env.__CCWP_BUILD_OPTIONS
    ? new URLSearchParams(env.__CCWP_BUILD_OPTIONS)
    : null;
  const variantOptions = __CCWP_BUILD_OPTIONS
    ? Object.fromEntries(__CCWP_BUILD_OPTIONS.entries())
    : {};
  
  // Log variant options for debugging
  if (Object.keys(variantOptions).length >0) {
    console.log('Building with variant options:', variantOptions);
  }


  return {
    mode: argv.mode || 'development',
    entry: './src/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 9000,
    },
  };
};
