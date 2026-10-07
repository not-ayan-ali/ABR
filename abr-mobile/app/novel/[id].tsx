import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { typography } from '../../../src/theme/typography';
import { getDeviceId } from '../../../src/lib/deviceId';
import { Heart, Star, ArrowBack, ArrowForward } from 'lucide-react-native';

export default function NovelDetails() {
  const { id } = useLocalSearchParams();
  const [novel, setNovel] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [firstEpisodeId, setFirstEpisodeId] = useState<string | null>(null);
  const [lastReadEpisodeId, setLastReadEpisodeId] = useState<string | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const BackIcon = I18nManager.isRTL ? ArrowForward : ArrowBack;

  useEffect(() => {
    fetchNovel();
  }, [id]);

  const fetchNovel = async () => {
    try {
      setError(false);
      setLoading(true);
      const { data, error: fetchError } = await supabase.from('novels').select('*').eq('id', id).single();
      if (fetchError) {
        setError(true);
      } else {
        setNovel(data);
      }

      const deviceId = await getDeviceId();

      // Published episodes in order, to pick the Start/Continue Reading target
      const { data: episodesData } = await supabase
        .from('episodes')
        .select('id')
        .eq('novel_id', id)
        .eq('status', 'published')
        .order('order', { ascending: true });
      const episodeIds = (episodesData || []).map((e: any) => e.id);
      if (episodeIds.length > 0) setFirstEpisodeId(episodeIds[0]);

      // Most recent reading progress for this novel on this device
      if (episodeIds.length > 0) {
        const { data: progressData } = await supabase
          .from('reading_progress')
          .select('episode_id')
          .eq('device_id', deviceId)
          .in('episode_id', episodeIds)
          .order('last_read_at', { ascending: false })
          .limit(1);
        if (progressData && progressData.length > 0) {
          setLastReadEpisodeId(progressData[0].episode_id);
        }
      }

      const { data: fav } = await supabase.from('favorites').select('*').eq('novel_id', id).eq('device_id', deviceId).single();
      setIsFavorite(!!fav);

      const { data: myRating } = await supabase.from('ratings').select('rating').eq('novel_id', id).eq('device_id', deviceId).single();
      if (myRating) setUserRating(myRating.rating);

      const { data: allRatings } = await supabase.from('ratings').select('rating').eq('novel_id', id);
      if (allRatings && allRatings.length > 0) {
        const sum = allRatings.reduce((acc: number, r: any) => acc + r.rating, 0);
        setAvgRating(Math.round((sum / allRatings.length) * 10) / 10);
        setRatingCount(allRatings.length);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    const deviceId = await getDeviceId();
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('novel_id', id).eq('device_id', deviceId);
    } else {
      await supabase.from('favorites').insert({ novel_id: id, device_id: deviceId });
    }
    setIsFavorite(!isFavorite);
  };

  const handleRate = async (rating: number) => {
    const deviceId = await getDeviceId();
    await supabase.from('ratings').upsert({
      device_id: deviceId,
      novel_id: id,
      rating,
      updated_at: new Date().toISOString()
    }, { onConflict: 'device_id, novel_id' });
    setUserRating(rating);
    fetchNovel();
  };

  if (loading) {
    return (
      <View style={[styles.centerState, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  if (error || !novel) {
    return (
      <View style={[styles.centerState, { backgroundColor: theme.background }]}>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
          لوڈ نہیں ہو سکا، دوبارہ کوشش کریں۔
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <BackIcon size={24} color={theme.onSurface} />
        </Pressable>
      </View>
      <Image source={{ uri: novel.cover_image_url }} style={styles.cover} />
      <View style={styles.content}>
        <Text style={[typography.headlineLg, { color: theme.onSurface }]}>{novel.title}</Text>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, marginBottom: 8 }]}>{novel.author}</Text>

        <View style={styles.badges}>
          <View style={[styles.badge, { borderColor: theme.outlineVariant }]}>
            <Text style={[typography.labelSm, { color: theme.onSurfaceVariant }]}>{novel.category}</Text>
          </View>
          <View style={[styles.badge, { borderColor: theme.outlineVariant }]}>
            <Text style={[typography.labelSm, { color: theme.onSurfaceVariant }]}>{novel.age_rating}</Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                color={theme.secondary}
                fill={star <= Math.round(avgRating) ? theme.secondary : 'transparent'}
              />
            ))}
          </View>
          <Text style={[typography.labelSm, { color: theme.onSurfaceVariant }]}>
            {avgRating} ({ratingCount})
          </Text>
        </View>

        <Text style={[typography.bodyLg, { color: theme.onSurface, marginBottom: 24 }]}>{novel.synopsis}</Text>

        <Pressable
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={() => {
            const target = lastReadEpisodeId || firstEpisodeId;
            if (target) {
              router.push(`/read/${target}` as any);
            } else {
              router.push(`/novel/${id}/episodes` as any);
            }
          }}
        >
          <Text style={[typography.labelMd, { color: theme.onSecondary }]}>
            {lastReadEpisodeId ? 'جاری رکھیں' : 'پڑھنا شروع کریں'}
          </Text>
        </Pressable>

        <Pressable style={styles.favButton} onPress={toggleFavorite}>
          <Heart size={20} color={theme.secondary} fill={isFavorite ? theme.secondary : 'transparent'} />
          <Text style={{ color: theme.secondary, marginLeft: 8 }}>
            {isFavorite ? 'پسندیدہ ہے' : 'پسندیدہ میں شامل کریں'}
          </Text>
        </Pressable>

        <View style={styles.rateSection}>
          <Text style={[typography.labelMd, { color: theme.onSurface, marginBottom: 8 }]}>ریٹنگ دیں:</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => handleRate(star)} hitSlop={8}>
                <Star
                  size={28}
                  color={theme.secondary}
                  fill={star <= userRating ? theme.secondary : 'transparent'}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { paddingHorizontal: 16, paddingVertical: 8 },
  cover: { width: '100%', height: 300 },
  content: { padding: 16 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  stars: { flexDirection: 'row', gap: 4 },
  button: { padding: 16, borderRadius: 4, alignItems: 'center', marginBottom: 12 },
  favButton: { flexDirection: 'row', alignItems: 'center', padding: 8, marginBottom: 16 },
  rateSection: { marginTop: 8 }
});
