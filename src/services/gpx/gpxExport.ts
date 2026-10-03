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
      // <ele> muss laut GPX-Schema vor <time> stehen, sonst weisen strenge
      // Leser die Datei zurueck. Punkte aus der Zeit vor 1.0.2 haben keine
      // Hoehe und lassen das Element weg.
      const elevation =
        point.altitude === null || point.altitude === undefined
          ? ''
          : `\n        <ele>${point.altitude.toFixed(1)}</ele>`;
      // Die gemeldete Genauigkeit wandert mit in die Datei. GPX 1.1 kennt kein
      // Feld dafuer, deshalb ein eigener Namensraum in <extensions> - fremde
      // Programme ueberlesen das, wir koennen hinterher aber nachvollziehen,
      // wie gut ein Punkt war. Ohne diese Angabe war bei der Auswertung der
      // Tour vom 29.09.2026 nicht zu klaeren, welche Ausreisser der Filter
      // haette erkennen muessen.
      //
      // Seit 1.0.4 steht die Hoehengenauigkeit daneben. Sie ist eine eigene
      // Groesse: Auf der Bergtour vom 03.10.2026 sprang die Hoehe dreimal um
      // ueber 130 Meter, waehrend <ntg:accuracy> unauffaellige 2 bis 5 Meter
      // meldete. Wer nur den horizontalen Wert hat, kann solche Punkte beim
      // Nachrechnen nicht finden.
      const felder: string[] = [];
      if (point.accuracy !== null && point.accuracy !== undefined) {
        felder.push(`          <ntg:accuracy>${point.accuracy.toFixed(1)}</ntg:accuracy>`);
      }
      if (point.altitudeAccuracy !== null && point.altitudeAccuracy !== undefined) {
        felder.push(
          `          <ntg:altitudeAccuracy>${point.altitudeAccuracy.toFixed(1)}</ntg:altitudeAccuracy>`,
        );
      }
      const extensions = felder.length
        ? `\n        <extensions>\n${felder.join('\n')}\n        </extensions>`
        : '';
      return `      <trkpt lat="${point.latitude}" lon="${point.longitude}">${elevation}\n        <time>${time}</time>${extensions}\n      </trkpt>`;
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
