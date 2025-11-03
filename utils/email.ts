import { Linking, Alert } from 'react-native';

/**
 * Open email client with a recipient email and prefilled subject/body.
 * @param email - recipient email address
 * @param subject - email subject line
 * @param body - email body text
 */
export async function openEmail(email: string, subject: string = '', body: string = '') {
  try {
    // Encode subject and body for mailto URL
    const encodedSubject = encodeURIComponent(subject || '');
    const encodedBody = encodeURIComponent(body || '');

    // Construct mailto URL
    let mailtoUrl = `mailto:${email}`;
    const params: string[] = [];
    
    if (encodedSubject) {
      params.push(`subject=${encodedSubject}`);
    }
    if (encodedBody) {
      params.push(`body=${encodedBody}`);
    }
    
    if (params.length > 0) {
      mailtoUrl += `?${params.join('&')}`;
    }

    // Check if mailto can be opened
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      Alert.alert('Error', 'Could not open email client. Please make sure you have an email app installed.');
    }
  } catch (err) {
    if (__DEV__) console.error('openEmail error', err);
    Alert.alert('Error', 'Could not open email client. Please try again.');
  }
}


