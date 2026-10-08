import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/typography';
import { getDeviceId } from '../../src/lib/deviceId';
import { Settings } from 'lucide-react-native';

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('username').then((name) => {
      if (name) setUsername(name);
    });
  }, []);

  const saveUsername = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    try {
      const deviceId = await getDeviceId();
      const { error } = await supabase.from('readers').upsert({ device_id: deviceId, username: trimmed });
      if (error) {
        alert('محفوظ نہیں ہو سکا، دوبارہ کوشش کریں۔');
        return;
      }
      await AsyncStorage.setItem('username', trimmed);
      setUsername(trimmed);
      setIsEditing(false);
    } catch (e) {
      alert('محفوظ نہیں ہو سکا، دوبارہ کوشش کریں۔');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.outlineVariant }]}>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[styles.input, { color: theme.onSurface, borderColor: theme.outlineVariant }]}
              value={username}
              onChangeText={setUsername}
              maxLength={40}
            />
            <Pressable onPress={saveUsername} style={[styles.saveBtn, { backgroundColor: theme.secondary }]}>
              <Text style={{ color: theme.onSecondary }}>محفوظ کریں</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setIsEditing(true)}>
            <Text style={[typography.headlineMd, { color: theme.onSurface }]}>{username || 'نام درج کریں'}</Text>
          </Pressable>
        )}
      </View>

      <Pressable 
        style={[styles.link, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]}
        onPress={() => router.push('/settings' as any)}
      >
        <Settings size={20} color={theme.secondary} />
        <Text style={[typography.labelMd, { color: theme.onSurface, marginLeft: 12 }]}>ترتیبات (Settings)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { paddingBottom: 24, marginBottom: 24, borderBottomWidth: 1 },
  editRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, padding: 8, borderWidth: 1, borderRadius: 4, textAlign: 'right' },
  saveBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 4 },
  link: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 6, borderWidth: 1 }
});
