import { View, Text, Pressable, StyleSheet, ScrollView, Alert, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Trash2, ArrowLeft, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography } from '../src/theme/typography';
import { getDeviceId } from '../src/lib/deviceId';
import { supabase } from '../src/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, theme } = useTheme();
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  const handleDeleteData = () => {
    Alert.alert(
      'ڈیٹا حذف کریں',
      'کیا آپ واقعی اس ڈیوائس سے متعلق تمام ڈیٹا (پسندیدہ، پڑھنے کی پیش رفت، ریٹنگز اور نام) حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
      [
        { text: 'منسوخ کریں', style: 'cancel' },
        {
          text: 'حذف کریں',
          style: 'destructive',
          onPress: async () => {
            try {
              const deviceId = await getDeviceId();

              // Delete rows from Supabase matching device_id
              const { error: err1 } = await supabase.from('favorites').delete().eq('device_id', deviceId);
              const { error: err2 } = await supabase.from('reading_progress').delete().eq('device_id', deviceId);
              const { error: err3 } = await supabase.from('ratings').delete().eq('device_id', deviceId);
              const { error: err4 } = await supabase.from('readers').delete().eq('device_id', deviceId);

              if (err1 || err2 || err3 || err4) {
                throw new Error('ڈیٹا حذف کرنے میں خرابی پیش آگئی۔ براہ کرم دوبارہ کوشش کریں۔');
              }

              // Clear local saved name and device id
              await AsyncStorage.removeItem('username');
              await AsyncStorage.removeItem('abr_device_id');

              // Return to Name Prompt screen
              router.replace('/name-prompt');
            } catch (e: any) {
              Alert.alert('خرابی', e.message || 'ڈیٹا حذف کرنے میں ناکامی ہوئی۔');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.outlineVariant }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <BackIcon size={24} color={theme.onSurface} />
        </Pressable>
        <Text style={[typography.labelMd, { color: theme.onSurface, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          ترتیبات (Settings)
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 16 }]}>تھیم (Theme)</Text>
      
      {(['system', 'dark', 'light'] as const).map((mode) => (
        <Pressable
          key={mode}
          style={[
            styles.option,
            { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer },
            themeMode === mode && { borderColor: theme.secondary }
          ]}
          onPress={() => setThemeMode(mode)}
        >
          <Text style={[typography.labelMd, { color: theme.onSurface }]}>
            {mode === 'system' ? 'سسٹم ڈیفالٹ' : mode === 'dark' ? 'ڈارک موڈ' : 'لائٹ موڈ'}
          </Text>
        </Pressable>
      ))}

      <View style={[styles.section, { borderColor: theme.outlineVariant }]}>
        <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 12 }]}>معلومات (About)</Text>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, marginBottom: 8 }]}>
          ABR (Urdu Serialized Novel Reader) v1.0.0
        </Text>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant }]}>
          پریمیم اردو ناولز کا بہترین مجموعہ۔ جملہ حقوق محفوظ ہیں۔
        </Text>
      </View>

      <View style={[styles.section, { borderColor: theme.outlineVariant }]}>
        <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 12 }]}>پرائیویسی</Text>
        <Pressable
          style={[styles.policyButton, { borderColor: theme.secondary, backgroundColor: theme.surfaceContainerLow }]}
          onPress={() => router.push('/privacy')}
        >
          <Shield size={20} color={theme.secondary} />
          <Text style={[typography.labelMd, { color: theme.onSurface, marginRight: 8 }]}>پرائیویسی پالیسی</Text>
        </Pressable>
      </View>

      <View style={[styles.section, { borderColor: theme.outlineVariant }]}>
        <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 12 }]}>ڈیٹا مینجمنٹ</Text>
        <Pressable
          style={[styles.deleteButton, { borderColor: theme.error, backgroundColor: theme.surfaceContainerLow }]}
          onPress={handleDeleteData}
        >
          <Trash2 size={20} color={theme.error} />
          <Text style={[typography.labelMd, { color: theme.error, marginRight: 8 }]}>میرا ڈیٹا حذف کریں</Text>
        </Pressable>
      </View>
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  scrollContent: { padding: 16 },
  option: { padding: 16, borderRadius: 6, borderWidth: 1, marginBottom: 12 },
  section: { marginTop: 24, padding: 16, borderRadius: 6, borderWidth: 1 },
  policyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
  }
});
