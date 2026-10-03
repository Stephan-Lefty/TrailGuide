/**
 * Minimale, framework-lose HTML-Seite fuer den Empfaenger eines Live-Links.
 * Bewusst simpel gehalten (kein eigenes Kartenrendering in v1): zeigt
 * Koordinaten, Alter der letzten Aktualisierung und einen Link zu Google
 * Maps, und pollt periodisch den API-Endpunkt fuer Updates.
 */
export function renderTrackView(token: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>NaturlustTrailGuide - Live-Standort</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f7f1e3;
    color: #1f2a23;
    margin: 0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    box-sizing: border-box;
  }
  h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
  p.hint { color: #3d4a3f; font-size: 0.9rem; margin-top: 0; }
  .card {
    background: #ebe1c8;
    border-radius: 16px;
    padding: 20px;
    max-width: 420px;
    width: 100%;
    margin-top: 16px;
    text-align: center;
  }
  a.maps-link {
    display: inline-block;
    margin-top: 16px;
    background: #2c4a2f;
    color: #ffffff;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 999px;
    font-weight: 600;
  }
  .status { font-size: 0.85rem; color: #3d4a3f; margin-top: 12px; }
  .expired { color: #8b3a3a; font-weight: 600; }
  .quality {
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    line-height: 1.35;
  }
  .quality-good { background: #d8e6d2; color: #2c4a2f; }
  .quality-rough { background: #f3e2c2; color: #7a5312; }
  .stale { background: #f0d2d2; color: #8b3a3a; }
  .standstill { background: #e3ecf5; color: #1f4b73; border-radius: 6px; padding: 10px 12px; margin: 10px 0; line-height: 1.45; }
</style>
</head>
<body>
  <h1>NaturlustTrailGuide</h1>
  <p class="hint">Live-Standort einer Wanderung - dieser Link ist zeitlich befristet.</p>
  <div class="card" id="card">
    <div id="content">Lade Standort...</div>
  </div>
  <script>
    const token = ${JSON.stringify(token)};

    /**
     * "vor 624s" zwingt den Leser zum Kopfrechnen - gerade dann, wenn es
     * darauf ankommt. Ab einer Minute wird deshalb in Minuten gerundet.
     */
    function formatAge(seconds) {
      if (seconds < 60) return 'vor ' + seconds + ' Sekunden';
      const minutes = Math.round(seconds / 60);
      if (minutes === 1) return 'vor 1 Minute';
      if (minutes < 60) return 'vor ' + minutes + ' Minuten';
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      return 'vor ' + hours + ' Std. ' + rest + ' Min.';
    }

    /** Uhrzeit in der Zeitzone des Lesers - er sitzt im Zweifel daneben im Tal. */
    function formatClock(ms) {
      const d = new Date(ms);
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    /** "seit 2 Std. 18 Min." - dieselbe Rundung wie bei formatAge. */
    function formatDuration(seconds) {
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return 'seit ' + minutes + ' Minuten';
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      return 'seit ' + hours + ' Std. ' + rest + ' Min.';
    }

    async function refresh() {
      try {
        const res = await fetch('/api/track/' + token);
        const content = document.getElementById('content');
        if (res.status === 404) {
          content.innerHTML = '<p class="expired">Dieser Link ist abgelaufen oder wurde beendet.</p>';
          return;
        }
        if (!res.ok) {
          content.innerHTML = '<p class="expired">Standort momentan nicht abrufbar.</p>';
          return;
        }
        const data = await res.json();
        if (!data.location) {
          content.innerHTML = '<p>Noch kein Standort empfangen. Wird gleich aktualisiert...</p>';
          return;
        }
        const { latitude, longitude, timestamp, accuracy, stationarySince } = data.location;
        const mapsUrl = 'https://www.google.com/maps?q=' + latitude + ',' + longitude;
        const secondsAgo = Math.max(0, Math.round((Date.now() - timestamp) / 1000));

        // Ein Retter soll auf einen Blick erkennen, ob er einen Punkt oder
        // einen Suchradius vor sich hat - ein Kartenpunkt allein suggeriert
        // sonst eine Genauigkeit, die es nicht gibt.
        let quality = '';
        if (typeof accuracy === 'number') {
          const radius = Math.round(accuracy);
          if (radius <= 50) {
            quality = '<p class="quality quality-good">Standort genau (±' + radius + ' m)</p>';
          } else {
            quality =
              '<p class="quality quality-rough">Nur ungefaehrer Standort (±' + radius + ' m).' +
              ' Aktuell kommt kein genauer Satellitenempfang durch - die Person kann sich' +
              ' irgendwo in diesem Umkreis befinden.</p>';
          }
        }

        // Steht die Person still, ist das die wichtigste Information auf der
        // Seite - und sie entschaerft zugleich das lange "Aktualisiert vor ...".
        // Wer sich nicht bewegt, loest keine neue Standortmessung aus; ohne
        // diesen Hinweis liest sich eine alte Uhrzeit wie ein totes Telefon.
        let standstill = '';
        if (typeof stationarySince === 'number') {
          const stillSeconds = Math.max(0, Math.round((Date.now() - stationarySince) / 1000));
          if (stillSeconds >= 300) {
            standstill =
              '<p class="standstill"><strong>Person bewegt sich nicht.</strong><br>' +
              'Position seit ' + formatClock(stationarySince) + ' Uhr unveraendert (' +
              formatDuration(stillSeconds) + ').</p>';
          }
        }

        const staleClass = secondsAgo >= 600 ? ' stale' : '';
        content.innerHTML =
          '<p>' + latitude.toFixed(5) + ', ' + longitude.toFixed(5) + '</p>' +
          '<a class="maps-link" href="' + mapsUrl + '" target="_blank" rel="noopener">In Google Maps oeffnen</a>' +
          quality +
          standstill +
          '<p class="status' + staleClass + '">Aktualisiert ' + formatAge(secondsAgo) + '</p>';
      } catch (e) {
        document.getElementById('content').innerHTML = '<p class="expired">Verbindung fehlgeschlagen.</p>';
      }
    }

    refresh();
    setInterval(refresh, 15000);
  </script>
</body>
</html>`;
}
