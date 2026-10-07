import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/typography';

const SEARCH_DEBOUNCE_MS = 300;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (text: string) => {
    setLoading(true);
    setError(false);
    setHasSearched(true);
    try {
      // Escape single quotes so the ilike filters can't be broken out of
      const safeText = text.trim().replace(/'/g, "''");
      const { data, error: fetchError } = await supabase
        .from('novels')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${safeText}%,author.ilike.%${safeText}%,category.ilike.%${safeText}%`);
      if (fetchError) {
        setError(true);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (e) {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setResults([]);
      setHasSearched(false);
      setError(false);
      setLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(trimmed), SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (query.trim()) {
      await runSearch(query.trim());
    }
    setRefreshing(false);
  }, [query, runSearch]);

  const renderBody = () => {
    if (loading && results.length === 0) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.secondary} />
        </View>
      );
    }
    if (error && results.length === 0) {
      return (
        <View style={styles.centerState}>
          <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
            لوڈ نہیں ہو سکا، دوبارہ کوشش کریں۔
          </Text>
        </View>
      );
    }
    if (!hasSearched) {
      return (
        <View style={styles.centerState}>
          <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
            ناول یا مصنف کا نام لکھ کر تلاش کریں۔
          </Text>
        </View>
      );
    }
    if (results.length === 0 && !loading) {
      return (
        <View style={styles.centerState}>
          <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
            کوئی نتیجہ نہیں ملا۔
          </Text>
        </View>
      );
    }
    return null;
  };

  const body = renderBody();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.input, { color: theme.onSurface, borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]}
        placeholder="ناول یا مصنف تلاش کریں..."
        placeholderTextColor={theme.onSurfaceVariant}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]}
            onPress={() => router.push(`/novel/${item.id}` as any)}
          >
            <Image source={{ uri: item.cover_image_url }} style={styles.cover} />
            <View style={styles.info}>
              <Text style={[typography.labelMd, { color: theme.onSurface }]}>{item.title}</Text>
              <Text style={[typography.labelSm, { color: theme.onSurfaceVariant }]}>{item.author}</Text>
            </View>
          </Pressable>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary} />}
        ListEmptyComponent={body}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { width: '100%', padding: 12, borderRadius: 4, borderWidth: 1, marginBottom: 16, textAlign: 'right' },
  card: { flexDirection: 'row', marginBottom: 12, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },
  cover: { width: 60, height: 80 },
  info: { padding: 8, justifyContent: 'center' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  listContent: { flexGrow: 1 }
});
