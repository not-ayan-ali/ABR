import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { typography } from '../../../src/theme/typography';
import { getDeviceId } from '../../../src/lib/deviceId';
import { ArrowBack, ArrowForward, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function ReadingScreen() {
  const { id } = useLocalSearchParams();
  const [episode, setEpisode] = useState<any>(null);
  const [siblingIds, setSiblingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const { theme } = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const progressRef = useRef(0);
  const episodeIdRef = useRef<string | null>(null);
  const BackIcon = I18nManager.isRTL ? ArrowForward : ArrowBack;

  progressRef.current = progress;

  useEffect(() => {
    fetchEpisode();
  }, [id]);

  const fetchEpisode = async () => {
    try {
      setError(false);
      setLoading(true);
      const { data, error: fetchError } = await supabase.from('episodes').select('*').eq('id', id).single();
      if (fetchError) {
        setError(true);
      } else {
        setEpisode(data);
        // Published siblings in order, for prev/next navigation
        const { data: siblings } = await supabase
          .from('episodes')
          .select('id')
          .eq('novel_id', data.novel_id)
          .eq('status', 'published')
          .order('order', { ascending: true });
        setSiblingIds((siblings || []).map((s: any) => s.id));
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async () => {
    const episodeId = episodeIdRef.current || id;
    if (!episodeId) return;
    const deviceId = await getDeviceId();
    await supabase.from('reading_progress').upsert({
      device_id: deviceId,
      episode_id: episodeId,
      progress_percent: Math.round(progressRef.current * 100),
      last_read_at: new Date().toISOString()
    }, { onConflict: 'device_id, episode_id' });
  }, [id]);

  useEffect(() => {
    episodeIdRef.current = (id as string) || null;
  }, [id]);

  // Save progress whenever the reader leaves this screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        saveProgress();
      };
    }, [saveProgress])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    if (contentSize.height > 0) {
      const currentProgress = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
      setProgress(Math.min(Math.max(currentProgress, 0), 1));
    }
  };

  const currentIndex = siblingIds.indexOf((id as string) || '');
  const prevId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < siblingIds.length - 1 ? siblingIds[currentIndex + 1] : null;

  if (loading) {
    return (
      <View style={[styles.centerState, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  if (error || !episode) {
    return (
      <View style={[styles.centerState, { backgroundColor: theme.background }]}>
        <Text style={[typography.bodyMd, { color: theme.onSurfaceVariant, textAlign: 'center' }]}>
          لوڈ نہیں ہو سکا، دوبارہ کوشش کریں۔
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.outlineVariant }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <BackIcon size={24} color={theme.onSurface} />
        </Pressable>
        <Text style={[typography.labelMd, { color: theme.onSurface, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          {episode.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.surfaceBright }]}>
        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.secondary }]} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        onMomentumScrollEnd={saveProgress}
        scrollEventThrottle={100}
      >
        <Text style={[typography.headlineMd, { color: theme.onSurface, marginBottom: 24, textAlign: 'center' }]}>
          {episode.title}
        </Text>
        <Text style={[
          typography.bodyLg,
          {
            color: theme.onSurface,
            textAlign: 'right',
            lineHeight: fontSize * 2,
            fontSize,
            fontFamily: 'NotoNastaliqUrdu_400Regular'
          }
        ]}>
          {episode.body}
        </Text>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { borderTopColor: theme.outlineVariant }]}>
        <Pressable
          style={[styles.navButton, !prevId && styles.navButtonDisabled]}
          onPress={() => prevId && router.push(`/read/${prevId}` as any)}
          disabled={!prevId}
          hitSlop={8}
        >
          <ChevronRight size={24} color={prevId ? theme.onSurface : theme.outlineVariant} />
          <Text style={[typography.labelSm, { color: prevId ? theme.onSurfaceVariant : theme.outlineVariant }]}>پچھلا</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => setFontSize((s) => Math.min(s + 2, 28))}
          hitSlop={8}
        >
          <Text style={[typography.labelMd, { color: theme.secondary }]}>A+</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => setFontSize((s) => Math.max(s - 2, 14))}
          hitSlop={8}
        >
          <Text style={[typography.labelMd, { color: theme.secondary }]}>A-</Text>
        </Pressable>
        <Pressable
          style={[styles.navButton, !nextId && styles.navButtonDisabled]}
          onPress={() => nextId && router.push(`/read/${nextId}` as any)}
          disabled={!nextId}
          hitSlop={8}
        >
          <ChevronLeft size={24} color={nextId ? theme.onSurface : theme.outlineVariant} />
          <Text style={[typography.labelSm, { color: nextId ? theme.onSurfaceVariant : theme.outlineVariant }]}>اگلا</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  progressTrack: { height: 3, overflow: 'hidden' },
  progressBar: { height: '100%' },
  content: { padding: 24, paddingBottom: 40 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  navButton: { alignItems: 'center', padding: 4 },
  navButtonDisabled: { opacity: 0.5 }
});
