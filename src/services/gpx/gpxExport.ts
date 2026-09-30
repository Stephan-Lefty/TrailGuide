import * as FileSystem from 'expo-file-system/legacy';

import type { Hike } from '../../types/hike';
import type { TrackPoint } from '../../types/location';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildGpxString(hike: Hike, points: TrackPoint[]): string {
  const name = `NaturlustTrailGuide - ${new Date(hike.startedAt).toISOString()}`;
  const trackPoints = points
    .map((point) => {
      const time = new Date(point.timestamp).toISOString();
      // Die gemeldete Genauigkeit wandert mit in die Datei. GPX 1.1 kennt kein
      // Feld dafuer, deshalb ein eigener Namensraum in <extensions> - fremde
      // Programme ueberlesen das, wir koennen hinterher aber nachvollziehen,
      // wie gut ein Punkt war. Ohne diese Angabe war bei der Auswertung der
      // Tour vom 29.09.2026 nicht zu klaeren, welche Ausreisser der Filter
      // haette erkennen muessen.
      const accuracy =
        point.accuracy === null || point.accuracy === undefined
          ? ''
          : `\n        <extensions>\n          <ntg:accuracy>${point.accuracy.toFixed(1)}</ntg:accuracy>\n        </extensions>`;
      return `      <trkpt lat="${point.latitude}" lon="${point.longitude}">\n        <time>${time}</time>${accuracy}\n      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NaturlustTrailGuide" xmlns="http://www.topografix.com/GPX/1/1" xmlns:ntg="https://naturlust.net/trailguide/gpx/1">
  <metadata>
    <name>${escapeXml(name)}</name>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>
`;
}

/** Schreibt den GPX-Inhalt in eine temporaere Datei und gibt die file:// URI zurueck. */
export async function writeGpxFile(hike: Hike, points: TrackPoint[]): Promise<{ uri: string; filename: string }> {
  const gpx = buildGpxString(hike, points);
  const dateLabel = new Date(hike.startedAt).toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const filename = `wanderung-${dateLabel}.gpx`;
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, gpx, { encoding: FileSystem.EncodingType.UTF8 });
  return { uri, filename };
}
