import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Header, Screen } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing, type } from '@/theme';

export default function EditNameScreen() {
  const router = useRouter();
  const name = useAppStore((s) => s.settings.name);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [value, setValue] = useState(name);

  const save = () => {
    updateSettings({ name: value.trim() });
    if (router.canGoBack()) router.back();
  };

  return (
    <Screen header={<Header title="İsmini Düzenle" leftIcon="back" variant="large" />}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={{ gap: spacing(5) }}>
        <Text style={type.caption}>
          İsmin yalnızca bu cihazda saklanır ve seni selamlamak için kullanılır.
        </Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Adın"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoFocus
          maxLength={30}
          returnKeyType="done"
          onSubmitEditing={save}
        />
        <Button label="Kaydet" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    ...type.input,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
});
