module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NOTA: react-native-reanimated/plugin DEBE ser el último plugin.
      'react-native-reanimated/plugin',
    ],
  };
};