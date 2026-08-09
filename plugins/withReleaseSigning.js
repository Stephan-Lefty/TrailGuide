const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Signiert Release-Builds mit dem echten Play-Store-Upload-Keystore statt
 * mit dem Debug-Keystore. Die Zugangsdaten liegen NICHT im Repo, sondern
 * nur lokal in ~/.gradle/gradle.properties (NTG_UPLOAD_*). Fehlen sie auf
 * einem Rechner (z.B. bei einem frischen Checkout), faellt der Release-Build
 * automatisch auf den Debug-Keystore zurueck, statt fehlzuschlagen - so
 * bleibt `expo run:android --variant release` fuer normale Tests auch ohne
 * den Upload-Keystore nutzbar.
 */
function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const marker = 'NTG_UPLOAD_STORE_FILE';
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    const signingConfigBlock = `
    release {
        if (project.hasProperty('NTG_UPLOAD_STORE_FILE')) {
            storeFile file(NTG_UPLOAD_STORE_FILE)
            storePassword NTG_UPLOAD_STORE_PASSWORD
            keyAlias NTG_UPLOAD_KEY_ALIAS
            keyPassword NTG_UPLOAD_KEY_PASSWORD
        } else {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
`;

    config.modResults.contents = config.modResults.contents.replace(
      /signingConfigs\s*\{\s*debug\s*\{[^}]*\}/,
      (match) => `${match}\n${signingConfigBlock}`,
    );

    config.modResults.contents = config.modResults.contents.replace(
      /release\s*\{\s*\n\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*signingConfig signingConfigs\.debug/,
      (match) => match.replace('signingConfig signingConfigs.debug', 'signingConfig signingConfigs.release'),
    );

    return config;
  });
}

module.exports = withReleaseSigning;
