import { Stack, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography } from '../src/theme/typography';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'صفحہ نہیں ملا' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[typography.headlineMd, { color: theme.onSurface }]}>
          یہ صفحہ موجود نہیں ہے۔
        </Text>
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          style={[styles.link, { borderColor: theme.secondary }]}
        >
          <Text style={[typography.labelMd, { color: theme.secondary }]}>
            ہوم پر جائیں
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 24,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
  },
});
