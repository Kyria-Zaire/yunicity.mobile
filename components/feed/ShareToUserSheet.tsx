import { useCallback, useMemo, useState, type RefObject } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import type { BottomSheetModal as BottomSheetModalType } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radii } from '@/constants/theme';
import { MOCK_PROFILES, PROFILE_COLORS, type MockProfile, type ProfileKind } from '@/constants/mockProfiles';
import { ProfileTypeBadge, type ProfileType } from '@/components/ui/Badge';

function profileName(p: MockProfile) {
  return 'name' in p ? p.name : 'Profil';
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

type Props = {
  modalRef: RefObject<BottomSheetModalType | null>;
};

export function ShareToUserSheet({ modalRef }: Props) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MOCK_PROFILES;
    return MOCK_PROFILES.filter((p) => profileName(p).toLowerCase().includes(s));
  }, [q]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const onSend = useCallback((p: MockProfile) => {
    Alert.alert('Partage', `Post partagé avec ${profileName(p)} ✓`);
    modalRef.current?.dismiss();
    setQ('');
  }, [modalRef]);

  const renderItem = useCallback(
    ({ item }: { item: MockProfile }) => {
      const name = profileName(item);
      const kind = item.type as ProfileKind;
      const color = PROFILE_COLORS[kind] ?? Colors.primary;
      return (
        <View style={styles.row}>
          <View style={[styles.av, { backgroundColor: color }]}>
            <Text style={styles.avTxt}>{initials(name)}</Text>
          </View>
          <View style={styles.mid}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <ProfileTypeBadge type={item.type as ProfileType} />
          </View>
          <Pressable onPress={() => onSend(item)} style={({ pressed }) => [styles.send, pressed && { opacity: 0.92 }]}>
            <Text style={styles.sendTxt}>Envoyer</Text>
          </Pressable>
        </View>
      );
    },
    [onSend],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      onDismiss={() => setQ('')}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Envoyer à</Text>
          <Pressable hitSlop={12} onPress={() => modalRef.current?.dismiss()} style={({ pressed }) => [pressed && { opacity: 0.75 }]}>
            <Ionicons name="close" size={22} color={Colors.dark} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} style={{ marginRight: 8 }} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher un utilisateur..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <BottomSheetFlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.white,
  },
  handle: { backgroundColor: Colors.grayBorder, width: 40 },
  inner: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 10,
  },
  title: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body.family, fontSize: 15, color: Colors.dark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  av: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.white },
  mid: { flex: 1, minWidth: 0, gap: 6 },
  name: { fontFamily: Fonts.titleSemi.family, fontSize: 15, color: Colors.dark },
  send: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 13, color: Colors.white },
});
