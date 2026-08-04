export interface EmergencyNumberEntry {
  countryCode: string; // ISO 3166-1 alpha-2, passend zu countryLookupService
  countryName: string;
  numbers: {
    label: string;
    number: string;
  }[];
  /** Datum, an dem die Nummer(n) zuletzt gegen eine offizielle Quelle geprueft wurden. */
  lastVerified: string;
}

export type ContactScope = 'permanent' | 'tour';

/** Maximale Anzahl dauerhaft gespeicherter Notfallkontakte (Prioritaet = sortOrder). */
export const MAX_PERMANENT_CONTACTS = 2;

export interface SavedContact {
  id: string;
  label: string;
  phoneNumber: string;
  sortOrder: number;
  scope: ContactScope;
  /** Nur gesetzt bei scope 'tour': die Wanderung, der dieser Kontakt zugeordnet ist. */
  hikeId: string | null;
}
