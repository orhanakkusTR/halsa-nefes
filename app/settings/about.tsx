import { StyleSheet, Text, View } from 'react-native';
import { HalsaLogo } from '@/components/HalsaLogo';
import { Card, Header, Screen } from '@/components/ui';
import { colors, spacing, type } from '@/theme';

export default function AboutScreen() {
  return (
    <Screen header={<Header title="Hälsa Hakkında" />}>
      <View style={{ gap: spacing(5) }}>
        <View style={styles.logoWrap}>
          <HalsaLogo width={150} />
          <Text style={[type.caption, { letterSpacing: 4 }]}>BREATHE</Text>
        </View>

        <Card>
          <Text style={[type.body, { color: colors.textSecondary, lineHeight: 24 }]}>
            Hälsa Breathe, İsveç uyku kültüründen ilham alan nefes egzersizleriyle daha
            sağlıklı bir uykuya ulaşmana yardımcı olur. Bilimsel nefes teknikleri, doğa
            sesleri ve 30 günlük uyku yolculuğu tek bir uygulamada.
          </Text>
        </Card>

        <Card>
          <Text style={type.title}>Hälsa</Text>
          <Text style={[type.caption, { marginTop: 4, lineHeight: 20 }]}>
            {`İskandinav sadeliği ve doğal malzemelerle üretilen yatak koleksiyonlarıyla Türkiye'de sağlıklı uykunun adresi.`}
          </Text>
        </Card>

        <Text style={[type.caption, { textAlign: 'center' }]}>Sürüm 1.0.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(4),
  },
});
