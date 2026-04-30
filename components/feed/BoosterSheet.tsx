import { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '@/constants/theme';
import type { BottomSheetModal as BottomSheetModalType } from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

type Props = {
  modalRef: RefObject<BottomSheetModalType | null>;
  onBoost: () => void;
};

export function BoosterSheet({ modalRef, onBoost }: Props) {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['25%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const onReport = useCallback(() => {
    modalRef.current?.dismiss();
    Alert.alert('Signalement', 'Signalement envoyé. Merci.');
  }, [modalRef]);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.inner}>
        <Text style={styles.title}>✨ Booster ce post</Text>
        <Text style={styles.sub}>Aide ce contenu à être vu par plus de Rémois</Text>
        <Pressable
          onPress={() => {
            modalRef.current?.dismiss();
            onBoost();
          }}
          style={({ pressed }) => [styles.boostPress, pressed && { opacity: 0.94 }]}
        >
          <LinearGradient colors={['#2A2FFF', '#7C3AED']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.boostGrad}>
            <Text style={styles.boostTxt}>🚀 Booster</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={onReport} hitSlop={12} style={({ pressed }) => [styles.report, pressed && { opacity: 0.8 }]}>
          <Text style={styles.reportTxt}>Signaler</Text>
        </Pressable>
      </BottomSheetView>
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
  inner: { paddingHorizontal: 20, paddingBottom: 20 },
  title: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
    textAlign: 'center',
    marginTop: 4,
  },
  sub: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  boostPress: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  boostGrad: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostTxt: { fontFamily: Fonts.title.family, fontSize: 16, color: Colors.white },
  report: { marginTop: 18, alignSelf: 'center', paddingVertical: 6 },
  reportTxt: { fontFamily: Fonts.body.family, fontSize: 14, color: '#DC2626' },
});
