/** Metro/Babel quand `expo start` est lancé depuis la racine du monorepo : alias `@/` → `apps/mobile/`. */
/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './apps/mobile',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.tsx', '.ts'],
        },
      ],
    ],
  };
};
