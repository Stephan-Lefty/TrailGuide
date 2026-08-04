export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TrackPoint extends Coordinates {
  timestamp: number;
  accuracy?: number | null;
}
