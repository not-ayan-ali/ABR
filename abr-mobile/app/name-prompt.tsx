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
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setErrorMsg('');
    setSaving(true);

    try {
      const deviceId = await getDeviceId();
      // Save locally
      await AsyncStorage.setItem('username', trimmedName);
      
      // Upsert to Supabase
      const { error } = await supabase.from('readers').upsert({
        device_id: deviceId,
        username: trimmedName
      });

      if (error) {
        setErrorMsg('محفوظ نہیں ہو سکا، دوبارہ کوشش کریں۔');
        setSaving(false);
        return;
      }

      router.replace('/(tabs)');
    } catch (e) {
      setErrorMsg('محفوظ نہیں ہو سکا، دوبارہ کوشش کریں۔');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 24 }]}>
        اپنا نام درج کریں
      </Text>
      {errorMsg ? (
        <Text style={[typography.labelSm, { color: theme.error, marginBottom: 12, textAlign: 'center' }]}>
          {errorMsg}
        </Text>
      ) : null}
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
        maxLength={40}
      />
      <Pressable 
        onPress={handleContinue}
        disabled={saving}
        style={[styles.button, { backgroundColor: theme.secondary, opacity: saving ? 0.7 : 1 }]}
      >
        <Text style={[typography.labelMd, { color: theme.onSecondary }]}>
          {saving ? 'محفوظ ہو رہا ہے...' : 'جاری رکھیں'}
        </Text>
      </Pressable>

      <Text style={[styles.policyNotice, { color: theme.onSurfaceVariant }]}>
        جاری رکھ کر آپ{' '}
        <Text 
          style={{ color: theme.secondary, textDecorationLine: 'underline' }}
          onPress={() => router.push('/privacy')}
        >
          پرائیویسی پالیسی
        </Text>
        {' '}سے اتفاق کرتے ہیں
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: { width: '100%', padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 16, textAlign: 'right' },
  button: { width: '100%', padding: 16, borderRadius: 4, alignItems: 'center', marginBottom: 16 },
  policyNotice: {
    fontFamily: 'NotoNastaliqUrdu_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
