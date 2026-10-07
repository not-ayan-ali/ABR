import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography } from '../src/theme/typography';
import { getDeviceId } from '../src/lib/deviceId';
import { supabase } from '../src/lib/supabase';

export default function NamePrompt() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { theme } = useTheme();

  const handleContinue = async () => {
    if (!name.trim()) return;

    try {
      const deviceId = await getDeviceId();
      // Save locally
      await AsyncStorage.setItem('username', name);
      
      // Upsert to Supabase
      await supabase.from('readers').upsert({
        device_id: deviceId,
        username: name
      });

      router.replace('/(tabs)');
    } catch (e) {
      // Error handled by UI state
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 24 }]}>
        اپنا نام درج کریں
      </Text>
      <TextInput
        style={[styles.input, { 
          color: theme.onSurface, 
          borderColor: theme.outlineVariant,
          backgroundColor: theme.surfaceContainer
        }]}
        placeholder="نام لکھیں..."
        placeholderTextColor={theme.onSurfaceVariant}
        value={name}
        onChangeText={setName}
      />
      <Pressable 
        onPress={handleContinue}
        style={[styles.button, { backgroundColor: theme.secondary }]}
      >
        <Text style={[typography.labelMd, { color: theme.onSecondary }]}>جاری رکھیں</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: { width: '100%', padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 16, textAlign: 'right' },
  button: { width: '100%', padding: 16, borderRadius: 4, alignItems: 'center' },
});
