export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TrackPoint extends Coordinates {
  timestamp: number;
  accuracy?: number | null;
  /** Hoehe ueber dem Meeresspiegel in Metern. Seit 1.0.2; aeltere Punkte haben null. */
  altitude?: number | null;
}
