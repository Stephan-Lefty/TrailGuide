import { Contact, requestPermissionsAsync } from 'expo-contacts';

export interface PickedContact {
  name: string;
  phoneNumber: string;
}

export type PickContactResult =
  | { status: 'picked'; contact: PickedContact }
  | { status: 'cancelled' }
  | { status: 'no_phone_number' }
  | { status: 'permission_denied' }
  | { status: 'error' };

/**
 * Oeffnet den nativen Kontakt-Picker. Das Auslesen der Details (Name,
 * Telefonnummer) des ausgewaehlten Kontakts benoetigt auf Android trotzdem
 * die READ_CONTACTS-Laufzeitberechtigung, deshalb wird sie hier explizit
 * angefragt statt sich auf die reine Picker-Geste zu verlassen.
 */
export async function pickContactWithPhone(): Promise<PickContactResult> {
  const { status } = await requestPermissionsAsync();
  if (status !== 'granted') {
    return { status: 'permission_denied' };
  }

  try {
    const contact = await Contact.presentPicker();
    if (!contact) {
      return { status: 'cancelled' };
    }

    const phones = await contact.getPhones();
    const firstPhone = phones.find((phone) => Boolean(phone.number));
    if (!firstPhone?.number) {
      return { status: 'no_phone_number' };
    }

    const [givenName, familyName] = await Promise.all([contact.getGivenName(), contact.getFamilyName()]);
    const name = [givenName, familyName].filter(Boolean).join(' ').trim();

    return {
      status: 'picked',
      contact: { name: name || firstPhone.number, phoneNumber: firstPhone.number },
    };
  } catch (error) {
    console.error('pickContactWithPhone failed', error);
    return { status: 'error' };
  }
}
