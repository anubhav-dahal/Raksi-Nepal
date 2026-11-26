// Config plugin for `npm run build:local` (tools/build-local.mjs).
//
// Release builds block plain http:// by default, but the local backend is
// http://<PC IP>:5000. This allows it, and only when LOCAL_BUILD=1, so EAS
// preview/production builds (https) keep the secure default.
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLocalBuild(config) {
  if (process.env.LOCAL_BUILD !== '1') return config;
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (application) application.$['android:usesCleartextTraffic'] = 'true';
    return cfg;
  });
};
