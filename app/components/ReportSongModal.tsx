import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';

interface ReportSongModalProps {
  visible: boolean;
  onClose: () => void;
  phone: string; // E.164 format e.g. +2347056928186
  title?: string;
  defaultMessage?: string;
}

export default function ReportSongModal({ visible, onClose, phone, title = 'Report or Suggest Changes', defaultMessage = '' }: ReportSongModalProps) {
  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    setMessage(defaultMessage || '');
  }, [defaultMessage, visible]);

  const openWhatsApp = async () => {
    try {
      const encoded = encodeURIComponent(message || '');
      const phoneDigits = phone.replace(/[^\d+]/g, '');
      const appUrl = `whatsapp://send?phone=${phoneDigits}&text=${encoded}`;
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
        onClose();
      } else {
        Alert.alert('WhatsApp not installed', 'Please install WhatsApp to send this report.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to open WhatsApp.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe the issue or suggestion..."
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openWhatsApp} style={[styles.button, styles.sendButton]}>
              <Text style={styles.sendText}>Send via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    minHeight: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  sendButton: {
    backgroundColor: '#25D366',
  },
  cancelText: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  sendText: {
    color: '#0B141A',
    fontWeight: '800',
  },
});


