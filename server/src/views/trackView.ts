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
        const { latitude, longitude, timestamp } = data.location;
        const mapsUrl = 'https://www.google.com/maps?q=' + latitude + ',' + longitude;
        const secondsAgo = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
        content.innerHTML =
          '<p>' + latitude.toFixed(5) + ', ' + longitude.toFixed(5) + '</p>' +
          '<a class="maps-link" href="' + mapsUrl + '" target="_blank" rel="noopener">In Google Maps oeffnen</a>' +
          '<p class="status">Aktualisiert vor ' + secondsAgo + 's</p>';
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
