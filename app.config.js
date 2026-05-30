/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const useGhPagesBasePath =
  process.env.EXPO_PUBLIC_GH_PAGES === '1' || process.env.NODE_ENV === 'production';

module.exports = {
  expo: {
    ...appJson.expo,
    experiments: {
      ...appJson.expo.experiments,
      // GitHub Pages needs /claridad; local dev (LAN/mobile) uses the server root.
      baseUrl: useGhPagesBasePath ? '/claridad' : undefined,
    },
  },
};
