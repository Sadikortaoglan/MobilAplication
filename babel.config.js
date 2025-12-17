module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
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
      // CRITICAL: react-native-reanimated/plugin MUST be last for BottomSheet to work
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};

