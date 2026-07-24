import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/theme';

// React Navigation's built-in label clamps its box to the font size with
// overflow hidden, chopping g/y descenders ("Sayfa" → "Savfa"). Rendering the
// label ourselves sidesteps that box entirely.
function tabLabel(label: string) {
  function TabLabel({ color }: { color: string }) {
    return (
      <Text testID="tab-label" style={[styles.label, { color }]}>
        {label}
      </Text>
    );
  }
  return TabLabel;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0E18',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(148,163,255,0.16)',
          // Web has no bottom safe-area; give labels explicit room there.
          ...(Platform.OS === 'web' ? { height: 64, paddingTop: 6, paddingBottom: 8 } : {}),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Ana Sayfa',
          tabBarLabel: tabLabel('Ana Sayfa'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Egzersizler',
          tabBarLabel: tabLabel('Egzersizler'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flower' : 'flower-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'İlerleme',
          tabBarLabel: tabLabel('İlerleme'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: tabLabel('Profil'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
  },
});
