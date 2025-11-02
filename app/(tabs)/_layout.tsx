import { Tabs } from 'expo-router';
import { Home, History, Trophy, Music } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#8B5CF6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarLabelStyle: styles.tabBarLabel,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ size, color }) => (
              <History size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Leaderboard',
            tabBarIcon: ({ size, color }) => (
              <Trophy size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="songlist"
          options={{
            title: 'List',
            tabBarIcon: ({ size, color }) => (
              <Music size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1F2937', // Match tab bar color
  },
  tabBar: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 30,
    paddingTop: 10,
    elevation: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
});