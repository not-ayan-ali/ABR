import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/typography';
import { getDeviceId } from '../../src/lib/deviceId';
import { Heart, BookOpen } from 'lucide-react-native';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const fetchFavorites = async () => {
    try {
      setError(false);
      const deviceId = await getDeviceId();
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('id, novels(*)')
        .eq('device_id', deviceId);
      if (fetchError) {
        setError(true);
        setFavorites([]);
      } else {
        setFavorites((data || []).map((item: any) => ({ ...item.novels, favoriteId: item.id })).filter((n) => n.id));
      }
    } catch (e) {
      setError(true);
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
  }, []);

  const handleUnfavorite = async (favoriteId: string) => {
    await supabase.from('favorites').delete().eq('id', favoriteId);
    setFavorites((prev) => prev.filter((n) => n.favoriteId !== favoriteId));
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerState, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary} />}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]}
            onPress={() => router.push(`/novel/${item.id}` as any)}
          >
            {item.cover_image_url ? (
              <Image source={{ uri: item.cover_image_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: theme.surfaceContainerHigh }]}>
                <BookOpen size={24} color={theme.secondary} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={[typography.labelMd, { color: theme.onSurface }]}>{item.title}</Text>
              <Text style={[typography.labelSm, { color: theme.onSurfaceVariant }]}>{item.author}</Text>
            </View>
            <Pressable
              onPress={() => handleUnfavorite(item.favoriteId)}
              style={styles.heartButton}
              hitSlop={8}
            >
              <Heart size={20} color={theme.secondary} fill={theme.secondary} />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          error ? (
            <View style={styles.centerState}>
              <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
                لوڈ نہیں ہو سکا، دوبارہ کوشش کریں۔
              </Text>
            </View>
          ) : (
            <View style={styles.centerState}>
              <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
                کوئی پسندیدہ ناول موجود نہیں ہے۔
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  card: { flexDirection: 'row', marginBottom: 12, borderRadius: 6, borderWidth: 1, overflow: 'hidden', alignItems: 'center' },
  cover: { width: 60, height: 80 },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { padding: 8, justifyContent: 'center', flex: 1 },
  heartButton: { padding: 12 }
});
