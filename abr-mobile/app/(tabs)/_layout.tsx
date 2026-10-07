import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.secondary,
      tabBarInactiveTintColor: theme.onSurfaceVariant,
      tabBarStyle: {
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: theme.outlineVariant,
      },
      tabBarLabelStyle: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
      },
    }}>
      <Tabs.Screen name="index" options={{ title: 'ہوم' }} />
      <Tabs.Screen name="search" options={{ title: 'تلاش' }} />
      <Tabs.Screen name="favorites" options={{ title: 'پسندیدہ' }} />
      <Tabs.Screen name="profile" options={{ title: 'پروفائل' }} />
    </Tabs>
  );
}
