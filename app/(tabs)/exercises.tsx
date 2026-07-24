import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconBadge, ListRow, Screen } from '@/components/ui';
import { durationRangeLabel, exercises } from '@/data/exercises';
import { spacing, type } from '@/theme';

export default function ExercisesScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ gap: spacing(1), marginBottom: spacing(5) }}>
        <Text style={type.h2}>Nefes Egzersizleri</Text>
        <Text style={type.caption}>İhtiyacına uygun egzersizi seç.</Text>
      </View>
      <View style={{ gap: spacing(3) }}>
        {exercises.map((e) => (
          <ListRow
            key={e.id}
            title={e.title}
            subtitle={durationRangeLabel(e)}
            left={<IconBadge icon={e.icon} color={e.color} shape="circle" />}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })}
          />
        ))}
      </View>
    </Screen>
  );
}
