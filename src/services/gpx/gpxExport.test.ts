import type { Hike } from '../../types/hike';
import type { TrackPoint } from '../../types/location';
import { buildGpxString } from './gpxExport';

// expo-file-system wird von buildGpxString nicht gebraucht, das Modul zieht es
// aber fuer writeGpxFile herein - in der Testumgebung gibt es kein Expo.
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn(),
}));

const HIKE: Hike = {
  id: 'test-hike',
  startedAt: Date.UTC(2026, 8, 29, 16, 7, 20),
  endedAt: Date.UTC(2026, 8, 29, 17, 50, 35),
  status: 'ended_incident',
  shareToken: null,
  shareExpiresAt: null,
};

function punkt(overrides: Partial<TrackPoint> = {}): TrackPoint {
  return {
    latitude: 47.3739067,
    longitude: 11.1492667,
    timestamp: Date.UTC(2026, 8, 29, 16, 36, 0),
    ...overrides,
  };
}

describe('buildGpxString', () => {
  it('erzeugt ein wohlgeformtes Grundgeruest', () => {
    const gpx = buildGpxString(HIKE, [punkt()]);
    expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(gpx).toContain('<gpx version="1.1"');
    expect(gpx).toContain('creator="NaturlustTrailGuide"');
    expect(gpx.trimEnd().endsWith('</gpx>')).toBe(true);
  });

  it('schreibt Koordinaten und Zeitstempel', () => {
    const gpx = buildGpxString(HIKE, [punkt()]);
    expect(gpx).toContain('<trkpt lat="47.3739067" lon="11.1492667">');
    expect(gpx).toContain('<time>2026-09-29T16:36:00.000Z</time>');
  });

  it('haelt die vom Schema vorgegebene Reihenfolge ein', () => {
    // GPX 1.1 schreibt fuer wptType eine feste Abfolge vor: ele vor time,
    // extensions zuletzt. Strenge Leser weisen die Datei sonst zurueck.
    const gpx = buildGpxString(HIKE, [punkt({ altitude: 1234.56, accuracy: 8.2 })]);
    const ele = gpx.indexOf('<ele>');
    const time = gpx.indexOf('<time>');
    const ext = gpx.indexOf('<extensions>');
    expect(ele).toBeGreaterThan(-1);
    expect(ele).toBeLessThan(time);
    expect(time).toBeLessThan(ext);
  });

  it('nimmt Hoehe und Genauigkeit mit, wenn sie vorliegen', () => {
    const gpx = buildGpxString(HIKE, [punkt({ altitude: 1234.56, accuracy: 8.24 })]);
    expect(gpx).toContain('<ele>1234.6</ele>');
    expect(gpx).toContain('<ntg:accuracy>8.2</ntg:accuracy>');
    expect(gpx).toContain('xmlns:ntg=');
  });

  it('laesst Hoehe und Genauigkeit weg, wenn sie fehlen', () => {
    // So sehen alle Aufzeichnungen vor 1.0.2 aus.
    const gpx = buildGpxString(HIKE, [punkt({ altitude: null, accuracy: null })]);
    expect(gpx).not.toContain('<ele>');
    expect(gpx).not.toContain('<extensions>');
  });

  it('behandelt undefined wie fehlende Werte', () => {
    const gpx = buildGpxString(HIKE, [punkt()]);
    expect(gpx).not.toContain('<ele>');
    expect(gpx).not.toContain('<extensions>');
  });

  it('schreibt eine Hoehe von null Metern trotzdem', () => {
    // 0 ist ein gueltiger Wert und darf nicht als "fehlt" durchfallen.
    const gpx = buildGpxString(HIKE, [punkt({ altitude: 0, accuracy: 0 })]);
    expect(gpx).toContain('<ele>0.0</ele>');
    expect(gpx).toContain('<ntg:accuracy>0.0</ntg:accuracy>');
  });

  it('schreibt alle uebergebenen Punkte', () => {
    const punkte = [punkt(), punkt({ latitude: 47.36036, longitude: 11.12249 })];
    const gpx = buildGpxString(HIKE, punkte);
    expect(gpx.match(/<trkpt /g)).toHaveLength(2);
  });

  it('kommt mit einer leeren Aufzeichnung klar', () => {
    const gpx = buildGpxString(HIKE, []);
    expect(gpx).toContain('<trkseg>');
    expect(gpx).not.toContain('<trkpt');
  });
});
