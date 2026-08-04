import { detectCountry } from './countryLookupService';

describe('detectCountry', () => {
  it('erkennt Oesterreich bei Koordinaten nahe Innsbruck', () => {
    const result = detectCountry({ latitude: 47.2692, longitude: 11.4041 });
    expect(result?.iso2).toBe('AT');
  });

  it('erkennt Frankreich bei Koordinaten nahe Chamonix', () => {
    const result = detectCountry({ latitude: 45.9237, longitude: 6.8694 });
    expect(result?.iso2).toBe('FR');
  });

  it('erkennt die Schweiz bei Koordinaten nahe Zermatt', () => {
    const result = detectCountry({ latitude: 46.0207, longitude: 7.7491 });
    expect(result?.iso2).toBe('CH');
  });

  it('liefert null fuer einen Punkt mitten im offenen Meer', () => {
    const result = detectCountry({ latitude: 0, longitude: -30 });
    expect(result).toBeNull();
  });

  it('unterscheidet Oesterreich und Deutschland nahe der Zugspitze', () => {
    const inAustria = detectCountry({ latitude: 47.1297, longitude: 10.2657 }); // St. Anton
    const inGermany = detectCountry({ latitude: 47.4917, longitude: 11.0956 }); // Garmisch-Partenkirchen
    expect(inAustria?.iso2).toBe('AT');
    expect(inGermany?.iso2).toBe('DE');
  });
});
