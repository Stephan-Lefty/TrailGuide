const { withGradleProperties } = require('@expo/config-plugins');

const SCHLUESSEL = 'reactNativeArchitectures';

/**
 * Nur die Prozessor-Architekturen bauen, die auf echten Telefonen vorkommen:
 * arm64-v8a (alles ab etwa 2016) und armeabi-v7a (aeltere Geraete).
 */
const ARCHITEKTUREN = 'armeabi-v7a,arm64-v8a';

/**
 * Setzt `reactNativeArchitectures` in android/gradle.properties, damit die
 * beiden Intel-Varianten x86 und x86_64 nicht mitgebaut werden.
 *
 * Hintergrund: React Native liefert jede native Bibliothek fuer vier
 * Architekturen mit. Gemessen an 1.0.5 waren das 79 von 100 MB, davon 43 MB
 * allein x86 und x86_64 - Architekturen, die ausserhalb von Emulatoren und
 * einigen Chromebooks niemand hat. Ueber den Play Store fiel das nicht auf,
 * weil Google aus dem AAB passgenaue Pakete schneidet. Wer die App dagegen
 * als APK von naturlust.net laedt, zieht die ganze Datei - und dann zaehlt
 * jedes Megabyte, womoeglich im Funkloch am Wanderparkplatz. Nachgemessen:
 * 104 MB vorher, 60 MB nachher.
 *
 * WICHTIG, das hat zwei Fehlversuche gekostet: Der naheliegende Weg ueber
 * `ndk { abiFilters ... }` in app/build.gradle **wirkt hier nicht**. Weder
 * im release-Block noch in defaultConfig - beides ist gebaut und nachgemessen
 * worden, die APK enthielt anschliessend unveraendert alle vier Varianten.
 * Bei einer gewoehnlichen Android-App funktioniert abiFilters (DialOS Mobil
 * macht es so), bei React Native nicht: Dort entscheidet das
 * React-Native-Gradle-Plugin ueber diese Eigenschaft, welche Bibliotheken
 * ueberhaupt erst entstehen. Deshalb gradle.properties und nicht build.gradle.
 *
 * Nebenwirkung: Auch Debug-Builds haben dann kein x86_64 mehr, der
 * Android-Emulator laeuft also nicht. Die App wird ohnehin immer am echten
 * Geraet getestet. Wer doch einen Emulator braucht, baut einmalig mit
 *
 *     ./gradlew assembleDebug -PreactNativeArchitectures=x86_64
 */
function mitArchitekturen(eigenschaften) {
  const vorhanden = eigenschaften.find(
    (e) => e.type === 'property' && e.key === SCHLUESSEL,
  );

  if (!vorhanden) {
    throw new Error(
      `withNativeArchitectures: ${SCHLUESSEL} steht nicht in gradle.properties. `
        + 'Die Expo-Vorlage hat sich geaendert - Plugin anpassen, sonst waechst '
        + 'die APK unbemerkt wieder um 43 MB.',
    );
  }

  if (vorhanden.value === ARCHITEKTUREN) {
    return eigenschaften;
  }

  return eigenschaften.map((e) =>
    e.type === 'property' && e.key === SCHLUESSEL
      ? { ...e, value: ARCHITEKTUREN }
      : e);
}

function withNativeArchitectures(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = mitArchitekturen(config.modResults);
    return config;
  });
}

module.exports = withNativeArchitectures;
module.exports.mitArchitekturen = mitArchitekturen;
module.exports.ARCHITEKTUREN = ARCHITEKTUREN;
