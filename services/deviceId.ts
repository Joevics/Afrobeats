import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'device_id';

function generateId() {
  const rand = Math.random().toString(36).slice(2);
  const time = Date.now().toString(36);
  return `nbq_${time}_${rand}`;
}

export async function getDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = generateId();
    await AsyncStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return generateId();
  }
}


