import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/typography';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
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
        <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 12 }]}>پراائیویسی پالیسی (Privacy Policy)</Text>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant }]}>
          ABR آپ کی ذاتی معلومات کی حفاظت کو سنجیدگی سے لیتا ہے۔ آپ کا نام اور پسندیدہ ناولز کی معلومات صرف آپ کے ڈیوائس اور محفوظ ڈیٹا بیس میں محفوظ کی جاتی ہے۔ ہم آپ کا ڈیٹا کسی تیسری فریق کے ساتھ شیئر نہیں کرتے۔ مزید تفصیلات کے لیے ہم سے رابطہ کریں۔
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  option: { padding: 16, borderRadius: 6, borderWidth: 1, marginBottom: 12 },
  section: { marginTop: 24, padding: 16, borderRadius: 6, borderWidth: 1 }
});
