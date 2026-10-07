import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography } from '../src/theme/typography';

export default function SplashScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      // Small delay to show the splash
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const username = await AsyncStorage.getItem('username');
      if (username) {
        router.replace('/(tabs)');
      } else {
        router.replace('/name-prompt');
      }
    };
    checkUser();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.logoMark, { borderColor: theme.secondary }]}>
        <Feather size={44} color={theme.secondary} />
      </View>
      <Text style={[typography.headlineXl, { color: theme.secondary }]}>
        ABR
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
