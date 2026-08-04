import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Feature, MultiPolygon, Polygon } from 'geojson';

import countriesGeoJson from '../../../assets/geo/countries-50m.json';
import type { Coordinates } from '../../types/location';

interface CountryProperties {
  iso2: string;
  name: string;
}

type CountryFeature = Feature<Polygon | MultiPolygon, CountryProperties> & {
  bbox: [number, number, number, number];
};

const countries = (countriesGeoJson as unknown as { features: CountryFeature[] }).features;

export interface CountryMatch {
  iso2: string;
  name: string;
}

function isWithinBbox(latitude: number, longitude: number, bbox: [number, number, number, number]): boolean {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return longitude >= minLon && longitude <= maxLon && latitude >= minLat && latitude <= maxLat;
}

/**
 * Rein lokale Punkt-in-Polygon-Suche gegen die gebündelten Ländergrenzen.
 * Kein Netzwerkaufruf nötig, funktioniert also auch im Funkloch am Berg.
 */
export function detectCountry(coords: Coordinates): CountryMatch | null {
  const candidate = point([coords.longitude, coords.latitude]);

  for (const feature of countries) {
    if (!isWithinBbox(coords.latitude, coords.longitude, feature.bbox)) {
      continue;
    }
    if (booleanPointInPolygon(candidate, feature.geometry)) {
      return { iso2: feature.properties.iso2, name: feature.properties.name };
    }
  }

  return null;
}
