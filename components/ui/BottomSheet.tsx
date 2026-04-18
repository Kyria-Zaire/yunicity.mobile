import type { ReactNode } from 'react';
import { forwardRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, Radii } from '@/constants/theme';

type Props = {
  children: ReactNode;
  snapPoints?: Array<string | number>;
};

export const AppBottomSheet = forwardRef<BottomSheet, Props>(function AppBottomSheet(
  { children, snapPoints },
  ref,
) {
  const points = useMemo(() => snapPoints ?? ['40%', '80%'], [snapPoints]);
  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={points}
      enablePanDownToClose
      backdropComponent={(p) => (
        <BottomSheetBackdrop {...p} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.content}>{children}</View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
  },
  handle: {
    backgroundColor: 'rgba(13,15,46,0.18)',
    width: 48,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

