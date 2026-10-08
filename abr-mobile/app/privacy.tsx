import React from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../src/theme/ThemeProvider';

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const openHostedPolicy = async () => {
    // Hosted URL will be updated in README/Code after Step P3
    await WebBrowser.openBrowserAsync('https://<my-netlify-site>/privacy.html');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowRight size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>پرائیویسی پالیسی</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Urdu Policy Text */}
        <Text style={[styles.bodyText, { color: colors.onSurface }]}>
          {`# ABR پرائیویسی پالیسی

**نافذ العمل:** 8 اکتوبر 2026
**آخری اپ ڈیٹ:** 8 اکتوبر 2026

## 1. ہم کون ہیں
ABR ایک موبائل ایپ ہے جس میں اردو ناول قسط وار پڑھے جا سکتے ہیں۔ اسے احسن بن رمضان شائع کرتا ہے۔ آپ ہم سے ahsanbinramzan.pk@gmail.com پر رابطہ کر سکتے ہیں۔

## 2. مختصر خلاصہ
ABR میں اکاؤنٹ، ای میل یا پاس ورڈ کی ضرورت نہیں۔ ہم اشتہارات نہیں دکھاتے اور آپ کا ڈیٹا فروخت نہیں کرتے۔ ہم صرف آپ کا ڈسپلے نام پوچھتے ہیں اور صرف وہی معلومات رکھتے ہیں جو ایپ چلانے کے لیے ضروری ہیں۔

## 3. ہم کون سی معلومات جمع کرتے ہیں
- **ڈسپلے نام:** وہ نام جو آپ ایپ پہلی بار کھولنے پر درج کرتے ہیں۔ آپ اسے بعد میں پروفائل میں تبدیل کر سکتے ہیں۔
- **ڈیوائس شناخت:** آپ کے ڈیوائس یا ایپ انسٹالیشن کے لیے بنائی گئی ایک منفرد آئی ڈی۔ اس کی مدد سے لاگ اِن کے بغیر آپ کے پسندیدہ ناول، پڑھنے کی پیش رفت اور ریٹنگز آپ کے ڈیوائس سے منسلک رہتی ہیں۔
- **پڑھنے کی سرگرمی:** جو ناول آپ پسندیدہ میں شامل کرتے ہیں، جو قسطیں آپ پڑھتے ہیں، کتنی پڑھتے ہیں (فیصد اور مقام)، اور آخری بار کب پڑھا۔
- **ریٹنگز:** کسی ناول کو آپ کی دی ہوئی 1 سے 5 ریٹنگ اور اس کا وقت۔
- **صرف آپ کے ڈیوائس پر محفوظ سیٹنگز:** آپ کی تھیم، پڑھنے کے متن کا سائز اور آپ کا نام۔
- **تکنیکی معلومات:** جب ایپ ہمارے سرور سے رابطہ کرتی ہے تو ہمارا ہوسٹنگ فراہم کنندہ معیاری سرور لاگز میں آئی پی ایڈریس جیسی تکنیکی معلومات پر عمل کر سکتا ہے۔

ہم آپ کا ای میل، فون نمبر، پتہ، مقام، رابطے (کانٹیکٹس)، تصاویر یا فائلیں، کیمرہ یا مائیکروفون کا ڈیٹا، ادائیگی کی معلومات، یا اشتہاری شناخت **جمع نہیں کرتے**۔

## 4. ہم آپ کی معلومات کیسے استعمال کرتے ہیں
- ایپ کی سہولیات فراہم کرنے کے لیے: پڑھنا جاری رکھنا، پسندیدہ اور ریٹنگز۔
- ہر ناول کی اوسط ریٹنگ دکھانے کے لیے۔
- ناشر کو مجموعی اعداد و شمار دکھانے کے لیے، جیسے کل پڑھائیاں، مقبول اقسام اور اوسط ریٹنگ۔
- ایپ کو محفوظ رکھنے اور مسائل ٹھیک کرنے کے لیے۔

ہم آپ کی معلومات اشتہارات کے لیے استعمال نہیں کرتے۔ ایپ آپ کا نام دوسرے قارئین کو نہیں دکھاتی۔

## 5. ہم معلومات کس کے ساتھ شیئر کرتے ہیں
- **سروس فراہم کنندگان:** ہم ڈیٹا بیس اور فائل اسٹوریج کے لیے Supabase استعمال کرتے ہیں۔ Supabase ہماری طرف سے ڈیٹا محفوظ रखता ہے۔
- **قانونی وجوہات:** اگر قانون یا کسی جائز قانونی عمل کے تحت ضروری ہو تو ہم معلومات فراہم کر سکتے ہیں۔

ہم آپ کی ذاتی معلومات فروخت یا کرائے پر نہیں دیتے۔

## 6. ذخیرہ اور تحفظ
آپ کا ڈیٹا ساؤتھ ایسٹ ایشیا (سنگاپور) میں واقع Supabase کے سرورز پر محفوظ ہوتا ہے، جو آپ کے ملک سے باہر بھی ہو سکتے ہیں۔ ایپ اور ہمارے سرورز کے درمیان منتقلی کے دوران ڈیٹا انکرپٹڈ (HTTPS) ہوتا ہے۔ چونکہ ایپ میں لاگ اِن نہیں ہے، آپ کی سرگرمی آپ کی ڈیوائس شناخت سے منسلک ہوتی ہے۔ کوئی بھی نظام مکمل طور پر محفوظ نہیں ہوتا، اس لیے ہم مکمل تحفظ کی ضمانت نہیں دے سکتے۔

## 7. ڈیٹا کی مدت اور حذف کرنا
ہم آپ کا ڈیٹا اس وقت تک رکھتے ہیں جب تک ایپ دستیاب ہے یا آپ اسے حذف نہ کر دیں۔ آپ ایپ میں ترتیبات (Settings) کے اندر "میرا ڈیٹا حذف کریں" کے ذریعے، یا ahsanbinramzan.pk@gmail.com پر ای میل کر کے اپنی ڈیوائس سے منسلک تمام معلومات حذف کروا سکتے ہیں۔ ایپ ان انسٹال کرنے سے آپ کے فون کا ڈیٹا ختم ہو جاتا ہے مگر ہمارے سرور پر محفوظ ڈیٹا خود بخود حذف نہیں ہوتا، اس لیے پہلے "میرا ڈیٹا حذف کریں" استعمال کریں۔

## 8. آپ کے اختیارات اور حقوق
آپ پروفائل میں اپنا نام تبدیل کر سکتے ہیں، اپنا ڈیٹا حذف کر سکتے ہیں، اور ahsanbinramzan.pk@gmail.com پر ای میل کر کے اپنے ڈیٹا تک رسائی یا اس کی درستگی کی درخواست کر سکتے ہیں۔ آپ کے ملک کے قوانین کے مطابق آپ کو مزید حقوق بھی حاصل ہو سکتے ہیں۔

## 9. بچے
ABR 13 سال سے کم عمر بچوں کے لیے نہیں ہے (یا آپ کے ملک میں مقرر اس سے زیادہ عمر)، اور ہم جان بوجھ کر ان سے ذاتی معلومات جمع نہیں کرتے۔ اگر آپ کو لگے کہ کسی بچے نے ہمیں اپنی ذاتی معلومات دی ہیں تو ہم سے رابطہ کریں، ہم انہیں حذف کر دیں گے۔ ناولز پر عمر کی درجہ بندی ظاہر کی جا سکتی ہے۔

## 10. پالیسی میں تبدیلی
اگر ہم اس پالیسی میں تبدیلی کریں گے تو اسے اسی صفحے پر اپ ڈیٹ کریں گے اور "آخری اپ ڈیٹ" کی تاریخ بدل دیں گے۔ تبدیلی کے بعد ایپ کا استعمال جاری رکھنے کی صورت میں نئی پالیسی لاگو ہوگی۔

## 11. رابطہ
احسن بن رمضان — ahsanbinramzan.pk@gmail.com

---

*(اگر انگریزی اور اردو ورژن میں فرق ہو تو انگریزی ورژن نافذ العمل ہوگا۔)*`}
        </Text>

        {/* Secondary Button to Open Hosted Policy */}
        <TouchableOpacity
          style={[styles.button, { borderColor: colors.secondary, backgroundColor: 'transparent' }]}
          onPress={openHostedPolicy}
        >
          <Text style={[styles.buttonText, { color: colors.secondary }]}>آن لائن مکمل پالیسی کھولیں</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontFamily: 'NotoNastaliqUrdu_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  bodyText: {
    fontFamily: 'NotoNastaliqUrdu_400Regular',
    fontSize: 16,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 32,
  },
  button: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
});
