module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Suppress EXPO_OS warning by ensuring proper env var handling
          jsxRuntime: 'automatic',
        },
      ],
    ],
    plugins: [
      [
        'inline-dotenv',
        {
          path: '.env',
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};

