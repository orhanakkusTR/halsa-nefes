import { Text, View } from 'react-native';
import { Card, Header, Screen } from '@/components/ui';
import { colors, spacing, type } from '@/theme';

const FAQ = [
  {
    q: 'Nefes egzersizini nasıl yapmalıyım?',
    a: 'Rahat bir pozisyonda otur veya uzan. Ekrandaki halkayı takip et: halka dolarken burnundan nefes al, "Bekle" fazında tut, "Nefes Ver" fazında ağzından yavaşça bırak.',
  },
  {
    q: 'Hangi egzersiz bana uygun?',
    a: 'Ana sayfadaki "Bugün nasıl hissediyorsun?" kartına dokun; ruh haline göre sana uygun egzersizi önerelim. Uyku için 4-7-8, stres için kutu nefesi iyi bir başlangıçtır.',
  },
  {
    q: 'Verilerim nerede saklanıyor?',
    a: 'Tüm verilerin (seanslar, seriler, ayarlar) yalnızca kendi telefonunda saklanır. Hesap gerekmez, hiçbir veri sunucuya gönderilmez.',
  },
  {
    q: 'Hatırlatıcı bildirimi gelmiyor, ne yapmalıyım?',
    a: 'Profil > Hatırlatıcı ekranından hatırlatıcının açık olduğundan emin ol. Telefon ayarlarından Hälsa Breathe için bildirim izni verilmiş olmalı.',
  },
  {
    q: 'Sleep Journey günü neden ilerlemiyor?',
    a: 'Günde en fazla bir yolculuk günü tamamlanabilir. Bugünün rutinini bitirdiysen, sonraki gün yarın aktif olur.',
  },
];

export default function HelpScreen() {
  return (
    <Screen header={<Header title="Yardım & Destek" />}>
      <View style={{ gap: spacing(3) }}>
        {FAQ.map((item, i) => (
          <Card key={i}>
            <Text style={type.title}>{item.q}</Text>
            <Text style={[type.caption, { marginTop: spacing(2), lineHeight: 20 }]}>
              {item.a}
            </Text>
          </Card>
        ))}
        <Text style={[type.caption, { textAlign: 'center', marginTop: spacing(3), color: colors.textMuted }]}>
          Başka bir sorun için Hälsa mağazalarından bize ulaşabilirsin.
        </Text>
      </View>
    </Screen>
  );
}
