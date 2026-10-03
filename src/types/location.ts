export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TrackPoint extends Coordinates {
  timestamp: number;
  accuracy?: number | null;
  /** Hoehe ueber dem Meeresspiegel in Metern. Seit 1.0.2; aeltere Punkte haben null. */
  altitude?: number | null;
  /**
   * Geschaetzte Unsicherheit der Hoehenangabe in Metern. Seit 1.0.4; aeltere
   * Punkte haben null.
   *
   * Bewusst eine eigene Angabe, denn `accuracy` sagt ueber die Hoehe nichts aus.
   * Die Bergtour vom 03.10.2026 hat das vorgefuehrt: Dreimal sprang die
   * gemeldete Hoehe binnen einer Minute um 127 bis 136 Meter, waehrend sich die
   * Position um weniger als einen Meter bewegte und das Geraet eine horizontale
   * Genauigkeit von 2 bis 5 Metern meldete. Solche Punkte sind am horizontalen
   * Wert nicht zu erkennen - sie haben den besten, den die Tour zu bieten hatte.
   *
   * Vorerst wird der Wert nur aufgezeichnet und exportiert, nicht ausgewertet.
   * Erst wenn aus einer echten Tour hervorgeht, wie verlaesslich Android ihn
   * meldet, laesst sich entscheiden, ob er als Filter taugt.
   */
  altitudeAccuracy?: number | null;
}
