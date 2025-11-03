import { Linking, Alert } from 'react-native';

/**
 * Open WhatsApp chat with a phone number and prefilled message.
 * @param phone - international phone, e.g. "+2347056928186" or "2347056928186"
 * @param message - text to prefill
 */
export async function openWhatsApp(phone: string, message: string = '') {
  try {
    // normalize phone: remove non-digits (strip +, spaces, dashes, parentheses)
    const normalizedPhone = phone.replace(/\D/g, '');

    // encode message
    const encodedMessage = encodeURIComponent(message || '');

    // deep link (app)
    const appUrl = `whatsapp://send?phone=${normalizedPhone}&text=${encodedMessage}`;

    // web fallback
    const webUrl = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;

    // First check if whatsapp:// can be opened
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
    } else {
      // iOS sometimes prefers the https link; open web fallback in browser
      await Linking.openURL(webUrl);
    }
  } catch (err) {
    if (__DEV__) console.error('openWhatsApp error', err);
    Alert.alert('Error', 'Could not open WhatsApp. Please make sure WhatsApp is installed or try again.');
  }
}


