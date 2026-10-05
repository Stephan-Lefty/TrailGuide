const { mitArchitekturen, ARCHITEKTUREN } = require('./withNativeArchitectures');

/** gradle.properties, wie `npx expo prebuild` sie schreibt - gekuerzt. */
const vorlage = () => [
  { type: 'comment', value: ' Use this property to specify which architecture you want to build.' },
  { type: 'property', key: 'reactNativeArchitectures', value: 'armeabi-v7a,arm64-v8a,x86,x86_64' },
  { type: 'property', key: 'newArchEnabled', value: 'true' },
  { type: 'property', key: 'hermesEnabled', value: 'true' },
];

const wert = (eigenschaften, schluessel) =>
  eigenschaften.find((e) => e.type === 'property' && e.key === schluessel)?.value;

describe('mitArchitekturen', () => {
  it('wirft x86 und x86_64 heraus', () => {
    // Nachgemessen am echten Build: 104 MB vorher, 60 MB nachher.
    expect(wert(mitArchitekturen(vorlage()), 'reactNativeArchitectures')).toBe(
      'armeabi-v7a,arm64-v8a',
    );
    expect(ARCHITEKTUREN).not.toContain('x86');
  });

  it('behaelt beide ARM-Architekturen', () => {
    // arm64-v8a allein wuerde aeltere Geraete ausschliessen - bei einer
    // Sicherheits-App ist das Altgeraet eher die Regel als die Ausnahme.
    expect(ARCHITEKTUREN).toContain('armeabi-v7a');
    expect(ARCHITEKTUREN).toContain('arm64-v8a');
  });

  it('laesst die uebrigen Eigenschaften unberuehrt', () => {
    const ergebnis = mitArchitekturen(vorlage());
    expect(wert(ergebnis, 'newArchEnabled')).toBe('true');
    expect(wert(ergebnis, 'hermesEnabled')).toBe('true');
    expect(ergebnis).toHaveLength(vorlage().length);
  });

  it('bleibt bei zweimaligem Anwenden unveraendert', () => {
    const einmal = mitArchitekturen(vorlage());
    expect(mitArchitekturen(einmal)).toBe(einmal);
  });

  it('bricht ab, wenn die Eigenschaft fehlt', () => {
    // Lieber ein abgebrochener Build als eine APK, die unbemerkt wieder um
    // 43 MB waechst, weil die Expo-Vorlage sich geaendert hat.
    const ohne = vorlage().filter((e) => e.key !== 'reactNativeArchitectures');
    expect(() => mitArchitekturen(ohne)).toThrow(/reactNativeArchitectures/);
  });
});
