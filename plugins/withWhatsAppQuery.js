const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Ab Android 11 (API 30) muss eine App per <queries> deklarieren, dass sie
 * pruefen darf, ob eine andere App (hier: WhatsApp) installiert ist - sonst
 * liefert Linking.canOpenURL('whatsapp://...') immer false, auch wenn
 * WhatsApp installiert ist (Package-Sichtbarkeits-Einschraenkung).
 */
function withWhatsAppQuery(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.queries) {
      manifest.queries = [{}];
    }
    const queries = manifest.queries[0];

    if (!queries.package) {
      queries.package = [];
    }

    const alreadyPresent = queries.package.some(
      (entry) => entry.$ && entry.$['android:name'] === 'com.whatsapp',
    );

    if (!alreadyPresent) {
      queries.package.push({ $: { 'android:name': 'com.whatsapp' } });
    }

    return config;
  });
}

module.exports = withWhatsAppQuery;
