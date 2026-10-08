import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Home, Search, Heart, User } from 'lucide-react-native';

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'ہوم',
          tabBarIcon: ({ color, size }: { color: string; size?: number }) => <Home size={size || 22} color={color} />
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'تلاش',
          tabBarIcon: ({ color, size }: { color: string; size?: number }) => <Search size={size || 22} color={color} />
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'پسندیدہ',
          tabBarIcon: ({ color, size }: { color: string; size?: number }) => <Heart size={size || 22} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'پروفائل',
          tabBarIcon: ({ color, size }: { color: string; size?: number }) => <User size={size || 22} color={color} />
        }}
      />
    </Tabs>
  );
}
