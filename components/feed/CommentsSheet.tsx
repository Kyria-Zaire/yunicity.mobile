import { useCallback, useMemo, useRef, useImperativeHandle, forwardRef, type Ref } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import { FeedCommentsBlock, type FeedCommentsBlockHandle } from '@/components/feed/FeedCommentsBlock';
import { useFeedCommentsStore } from '@/stores/feedComments.store';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  postId: string;
  baseCommentCount: number;
  onDismiss?: () => void;
};

export type CommentsSheetHandle = {
  focusInput: () => void;
};

export const CommentsSheet = forwardRef(function CommentsSheet(
  { modalRef, postId, baseCommentCount, onDismiss }: Props,
  ref: Ref<CommentsSheetHandle | null>,
) {
  const insets = useSafeAreaInsets();
  const added = useFeedCommentsStore((s) => (postId ? (s.addedCount[postId] ?? 0) : 0));
  const total = baseCommentCount + added;
  const snapPoints = useMemo(() => ['60%', '90%'], []);
  const blockRef = useRef<FeedCommentsBlockHandle | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      focusInput: () => {
        blockRef.current?.focusComposer();
      },
    }),
    [],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const scheduleFocus = useCallback(() => {
    setTimeout(() => blockRef.current?.focusComposer(), 300);
  }, []);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onDismiss}
      onChange={(index) => {
        if (index >= 0) scheduleFocus();
      }}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.sheetInner}>
        <View style={styles.sheetHeader}>
          <View style={styles.headerSide} />
          <Text style={styles.sheetTitle}>Commentaires</Text>
          <Pressable
            hitSlop={12}
            onPress={() => modalRef.current?.dismiss()}
            style={({ pressed }) => [styles.headerSide, styles.closeWrap, pressed && { opacity: 0.75 }]}
          >
            <Ionicons name="close" size={22} color={Colors.dark} />
          </Pressable>
        </View>
        <Text style={styles.sheetSub}>
          {total} commentaire{total > 1 ? 's' : ''}
        </Text>
        {postId ? (
          <View style={styles.flex1}>
            <FeedCommentsBlock
              ref={blockRef}
              postId={postId}
              baseCommentCount={baseCommentCount}
              ListComponent={BottomSheetFlatList as unknown as React.ComponentType<Record<string, unknown>>}
              showListCountHeader={false}
              disableKeyboardAvoiding
              useBottomSheetTextInput
            />
          </View>
        ) : null}
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.white,
  },
  handle: { backgroundColor: Colors.grayBorder, width: 40 },
  sheetInner: { flex: 1, paddingHorizontal: 16 },
  flex1: { flex: 1, minHeight: 200 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  headerSide: { width: 40, height: 40 },
  closeWrap: { alignItems: 'flex-end', justifyContent: 'center' },
  sheetTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  sheetSub: {
    textAlign: 'center',
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 8,
  },
});
