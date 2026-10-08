import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/lib/supabase';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography } from '../../src/theme/typography';
import { getDeviceId } from '../../src/lib/deviceId';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react-native';

export default function ReadingScreen() {
  const { episodeId } = useLocalSearchParams();
  const [episode, setEpisode] = useState<any>(null);
  const [siblingIds, setSiblingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const { theme, themeMode, setThemeMode } = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const progressRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const episodeIdRef = useRef<string | null>(null);
  const initialScrollPosRef = useRef<number>(0);
  const hasRestoredScrollRef = useRef<boolean>(false);
  const BackIcon = I18nManager.isRTL ? ArrowRight : ArrowLeft;

  progressRef.current = progress;

  // Load saved font size preference
  useEffect(() => {
    AsyncStorage.getItem('reading_font_size').then((savedSize) => {
      if (savedSize) {
        const parsed = parseInt(savedSize, 10);
        if (!isNaN(parsed)) setFontSize(parsed);
      }
    });
  }, []);

  const updateFontSize = (newSize: number) => {
    setFontSize(newSize);
    AsyncStorage.setItem('reading_font_size', newSize.toString());
  };

  useEffect(() => {
    hasRestoredScrollRef.current = false;
    fetchEpisode();
  }, [episodeId]);

  const fetchEpisode = async () => {
    try {
      setError(false);
      setLoading(true);
      const { data, error: fetchError } = await supabase.from('episodes').select('*').eq('id', episodeId).single();
      if (fetchError) {
        setError(true);
      } else {
        setEpisode(data);
        const deviceId = await getDeviceId();

        // Query saved scroll position & progress
        const { data: progressData } = await supabase
          .from('reading_progress')
          .select('scroll_position, progress_percent')
          .eq('device_id', deviceId)
          .eq('episode_id', episodeId)
          .maybeSingle();

        if (progressData && progressData.scroll_position) {
          initialScrollPosRef.current = Number(progressData.scroll_position);
        } else {
          initialScrollPosRef.current = 0;
        }

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
    const epId = episodeIdRef.current || episodeId;
    if (!epId) return;
    try {
      const deviceId = await getDeviceId();
      await supabase.from('reading_progress').upsert({
        device_id: deviceId,
        episode_id: epId,
        progress_percent: Math.round(progressRef.current * 100),
        scroll_position: Math.round(scrollOffsetRef.current),
        last_read_at: new Date().toISOString()
      }, { onConflict: 'device_id,episode_id' });
    } catch (e) {
      // Progress save failure
    }
  }, [episodeId]);

  useEffect(() => {
    episodeIdRef.current = (episodeId as string) || null;
  }, [episodeId]);

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
    scrollOffsetRef.current = contentOffset.y;
    if (contentSize.height > 0) {
      const currentProgress = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
      setProgress(Math.min(Math.max(currentProgress, 0), 1));
    }
  };

  const handleContentSizeChange = () => {
    if (!hasRestoredScrollRef.current && initialScrollPosRef.current > 0) {
      hasRestoredScrollRef.current = true;
      scrollViewRef.current?.scrollTo({ y: initialScrollPosRef.current, animated: false });
    }
  };

  const currentIndex = siblingIds.indexOf((episodeId as string) || '');
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

  const toggleTheme = () => {
    if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

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
        <Pressable onPress={toggleTheme} hitSlop={8}>
          {themeMode === 'dark' ? (
            <Sun size={22} color={theme.secondary} />
          ) : (
            <Moon size={22} color={theme.secondary} />
          )}
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.surfaceBright }]}>
        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.secondary }]} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
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
          onPress={() => prevId && router.replace(`/read/${prevId}` as any)}
          disabled={!prevId}
          hitSlop={8}
        >
          <ChevronRight size={24} color={prevId ? theme.onSurface : theme.outlineVariant} />
          <Text style={[typography.labelSm, { color: prevId ? theme.onSurfaceVariant : theme.outlineVariant }]}>پچھلا</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => updateFontSize(Math.min(fontSize + 2, 28))}
          hitSlop={8}
        >
          <Text style={[typography.labelMd, { color: theme.secondary }]}>A+</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => updateFontSize(Math.max(fontSize - 2, 14))}
          hitSlop={8}
        >
          <Text style={[typography.labelMd, { color: theme.secondary }]}>A-</Text>
        </Pressable>
        <Pressable
          style={[styles.navButton, !nextId && styles.navButtonDisabled]}
          onPress={() => nextId && router.replace(`/read/${nextId}` as any)}
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
