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
      return `      <trkpt lat="${point.latitude}" lon="${point.longitude}">\n        <time>${time}</time>\n      </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NaturlustTrailGuide" xmlns="http://www.topografix.com/GPX/1/1">
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
