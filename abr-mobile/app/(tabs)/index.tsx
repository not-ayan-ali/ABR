import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, Pressable, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/typography';
import { getDeviceId } from '../../src/lib/deviceId';

export default function Home() {
  const [novels, setNovels] = useState<any[]>([]);
  const [continueReading, setContinueReading] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const fetchData = async () => {
    try {
      const deviceId = await getDeviceId();

      // Fetch published novels
      const { data: novelsData } = await supabase
        .from('novels')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (novelsData) setNovels(novelsData);

      // Fetch continue reading items
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('progress_percent, episodes(id, title, novel_id, novels(id, title, cover_image_url, author))')
        .eq('device_id', deviceId)
        .order('last_read_at', { ascending: false });

      if (progressData) {
        // Extract unique novels from progress
        const uniqueNovelsMap = new Map();
        progressData.forEach((item: any) => {
          if (item.episodes?.novels) {
            const novel = item.episodes.novels;
            if (!uniqueNovelsMap.has(novel.id)) {
              uniqueNovelsMap.set(novel.id, { ...novel, progress: item.progress_percent, episodeId: item.episodes.id });
            }
          }
        });
        setContinueReading(Array.from(uniqueNovelsMap.values()));
      }
    } catch (e) {
      // Error handled by UI state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
  }, []);

  const renderNovelCard = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.card, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]}
      onPress={() => router.push(`/novel/${item.id}` as any)}
    >
      <Image source={{ uri: item.cover_image_url }} style={styles.cover} />
      <View style={styles.cardInfo}>
        <Text style={[typography.labelMd, { color: theme.onSurface, textAlign: 'right' }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[typography.labelSm, { color: theme.onSurfaceVariant, textAlign: 'right' }]} numberOfLines={1}>{item.author}</Text>
      </View>
    </Pressable>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary} />}
    >
      {/* Featured Hero */}
      {novels[0] && (
        <Pressable 
          style={[styles.hero, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainerHigh }]}
          onPress={() => router.push(`/novel/${novels[0].id}` as any)}
        >
          {novels[0].cover_image_url && <Image source={{ uri: novels[0].cover_image_url }} style={styles.heroCover} />}
          <View style={styles.heroContent}>
            <Text style={[typography.headlineMd, { color: theme.onSurface, textAlign: 'right' }]}>{novels[0].title}</Text>
            <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'right' }]} numberOfLines={2}>{novels[0].synopsis}</Text>
          </View>
        </Pressable>
      )}

      {/* Continue Reading Shelf */}
      {continueReading.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.headlineMd, { color: theme.onSurface, paddingHorizontal: 16, marginBottom: 8, textAlign: 'right' }]}>جاری رکھیں</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} inverted>
            {continueReading.map((item) => (
              <Pressable 
                key={item.id}
                style={[styles.continueCard, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]}
                onPress={() => router.push(`/read/${item.episodeId}` as any)}
              >
                <Image source={{ uri: item.cover_image_url }} style={styles.continueCover} />
                <View style={styles.continueInfo}>
                  <Text style={[typography.labelMd, { color: theme.onSurface, textAlign: 'right' }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.miniProgressBar, { backgroundColor: theme.surfaceBright }]}>
                    <View style={{ width: `${item.progress}%`, height: '100%', backgroundColor: theme.secondary, alignSelf: 'flex-end' }} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Grid */}
      <Text style={[typography.headlineMd, { color: theme.onSurface, paddingHorizontal: 16, marginBottom: 8, textAlign: 'right' }]}>تمام ناول</Text>
      {novels.length > 0 ? (
        <FlatList
          data={novels}
          renderItem={renderNovelCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant }]}>کوئی ناول دستیاب نہیں ہے۔</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { margin: 16, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },
  heroCover: { width: '100%', height: 200 },
  heroContent: { padding: 16 },
  card: { flex: 1, margin: 8, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },
  cover: { width: '100%', height: 160 },
  cardInfo: { padding: 8 },
  list: { paddingHorizontal: 8, paddingBottom: 24 },
  continueCard: { width: 140, marginLeft: 12, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },
  continueCover: { width: '100%', height: 140 },
  continueInfo: { padding: 8 },
  miniProgressBar: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  emptyState: { padding: 40, alignItems: 'center' }
});
