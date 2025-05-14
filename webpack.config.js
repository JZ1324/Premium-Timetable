const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

// Get the environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Load the .env file based on the environment
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, envFile);

// Parse the env file
const envParsed = fs.existsSync(envPath) 
  ? dotenv.parse(fs.readFileSync(envPath)) 
  : {};

// Construct environment variables object with defaults
const envKeys = Object.keys(envParsed).reduce((prev, key) => {
  prev[`process.env.${key}`] = JSON.stringify(envParsed[key]);
  return prev;
}, {
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  // Provide default values for Firebase config to prevent errors
  'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY || envParsed.REACT_APP_FIREBASE_API_KEY || ''),
  'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || envParsed.REACT_APP_FIREBASE_AUTH_DOMAIN || ''),
  'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_PROJECT_ID || envParsed.REACT_APP_FIREBASE_PROJECT_ID || ''),
  'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || envParsed.REACT_APP_FIREBASE_STORAGE_BUCKET || ''),
  'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || envParsed.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || ''),
  'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID || envParsed.REACT_APP_FIREBASE_APP_ID || ''),
  'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID': JSON.stringify(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || envParsed.REACT_APP_FIREBASE_MEASUREMENT_ID || '')
});

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      templateParameters: (compilation, assets, assetTags, options) => {
        return {
          PUBLIC_URL: '.', // Set to '.' for relative paths
          compilation: compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options: options
          },
          REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY || envParsed.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0',
          REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || envParsed.REACT_APP_FIREBASE_AUTH_DOMAIN || 'timetable-28639.firebaseapp.com',
          REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID || envParsed.REACT_APP_FIREBASE_PROJECT_ID || 'timetable-28639',
          REACT_APP_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || envParsed.REACT_APP_FIREBASE_STORAGE_BUCKET || 'timetable-28639.firebasestorage.app',
          REACT_APP_FIREBASE_MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || envParsed.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '653769103112',
          REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID || envParsed.REACT_APP_FIREBASE_APP_ID || '1:653769103112:web:7b7fe45718bec053843ebd',
          REACT_APP_FIREBASE_MEASUREMENT_ID: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || envParsed.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-J0F10129PJ'
        };
      }
    }),
    new webpack.DefinePlugin(envKeys),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'src/assets', 
          to: 'assets' 
        },
        {
          from: 'public/404.html',
          to: '404.html',
          noErrorOnMissing: true  // This ensures webpack doesn't fail if the file is missing
        },
        {
          from: 'public/favicon.ico',
          to: 'favicon.ico',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: 3001,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/__/firebase': {
        target: 'https://timetable-28639.web.app',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};