import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMessage: 'Please check your internet connection and try again.' };
  }

  componentDidCatch(error: any, info: any) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('Uncaught error:', error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  handleReport = () => {
    const phoneNumber = '+2348092998662';
    const message = encodeURIComponent('I encountered an error in AfroBeats Quiz app. Please help.');
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      // Fallback if WhatsApp is not installed
      const smsUrl = `sms:${phoneNumber}?body=${message}`;
      Linking.openURL(smsUrl).catch(() => {
        if (__DEV__) console.log('Could not open WhatsApp or SMS');
      });
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! An error occurred</Text>
          <Text style={styles.message}>
            {this.state.errorMessage || 'Please check your internet connection and try again.'}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={this.handleReload} style={styles.button}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.handleReport} style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ErrorBoundary;




