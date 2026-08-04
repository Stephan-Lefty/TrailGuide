import { useCallback, useEffect, useState } from 'react';

import { listContactsForHike } from '../services/contacts/contactsRepository';
import { getActiveHike } from '../services/hike/hikeRepository';
import type { SavedContact } from '../types/emergencyNumber';

/** Liefert dauerhafte Kontakte plus - falls eine Wanderung aktiv ist - den Tour-Kontakt dazu. */
export function useSavedContacts() {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const activeHike = getActiveHike();
      const rows = await listContactsForHike(activeHike?.id ?? null);
      setContacts(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { contacts, loading, reload };
}
