import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { typography } from '../../../src/theme/typography';
import { getDeviceId } from '../../../src/lib/deviceId';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

export default function EpisodesList() {
  const { id } = useLocalSearchParams();
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [readEpisodeIds, setReadEpisodeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    fetchEpisodes();
  }, [id]);

  const fetchEpisodes = async () => {
    try {
      setError(false);
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('episodes')
        .select('id, title, "order", published_at')
        .eq('novel_id', id)
        .eq('status', 'published')
        .order('order', { ascending: true });
      if (fetchError) {
        setError(true);
      } else {
        setEpisodes(data || []);

        // Mark episodes this device has finished (>= 95% read)
        const deviceId = await getDeviceId();
        const episodeIds = (data || []).map((e: any) => e.id);
        if (episodeIds.length > 0) {
          const { data: progressData } = await supabase
            .from('reading_progress')
            .select('episode_id, progress_percent')
            .eq('device_id', deviceId)
            .in('episode_id', episodeIds)
            .gte('progress_percent', 95);
          setReadEpisodeIds(new Set((progressData || []).map((p: any) => p.episode_id)));
        }
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerState, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerState, { backgroundColor: theme.background }]}>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
          لوڈ نہیں ہو سکا، دوبارہ کوشش کریں۔
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { borderBottomColor: theme.outlineVariant }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <BackIcon size={24} color={theme.onSurface} />
        </Pressable>
        <Text style={[typography.labelMd, { color: theme.onSurface, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          اقساط
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.item, { borderBottomColor: theme.outlineVariant }]}
            onPress={() => router.push(`/read/${item.id}` as any)}
          >
            <View style={[styles.readDot, { borderColor: theme.secondary, backgroundColor: readEpisodeIds.has(item.id) ? theme.secondary : 'transparent' }]} />
            <View style={styles.itemText}>
              <Text style={[typography.labelMd, { color: theme.onSurface }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[typography.labelSm, { color: theme.onSurfaceVariant }]}>
                قسط #{item.order}
                {item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString()}` : ''}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant }]}>
              ابھی کوئی قسط شائع نہیں ہوئی ہے۔
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centerState: { justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 8, borderBottomWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  readDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, marginRight: 12 },
  itemText: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center' }
});
