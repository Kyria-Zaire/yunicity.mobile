import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts } from '@/constants/theme';
import type { BottomSheetModal as BottomSheetModalType } from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

export type NewStoryPayload = {
  id: string;
  profileId: string;
  imageUri?: string | null;
  text?: string | null;
  videoUri?: string | null;
};

type Props = {
  modalRef: RefObject<BottomSheetModalType | null>;
  meProfileId: string;
  onPublish: (story: NewStoryPayload) => void;
};

export function CreateStorySheet({ modalRef, meProfileId, onPublish }: Props) {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['40%'], []);
  const [mode, setMode] = useState<'none' | 'photo' | 'text' | 'video'>('none');
  const [textBody, setTextBody] = useState('');
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
    ),
    [],
  );

  const reset = useCallback(() => {
    setMode('none');
    setTextBody('');
    setPickedUri(null);
    setBusy(false);
  }, []);

  const pickPhoto = useCallback(async () => {
    setBusy(true);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', "L'accès à la galerie est nécessaire pour choisir une photo.");
      setBusy(false);
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    setBusy(false);
    if (!res.canceled && res.assets[0]) {
      setPickedUri(res.assets[0].uri);
      setMode('photo');
    }
  }, []);

  const pickVideo = useCallback(async () => {
    setBusy(true);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', "L'accès à la galerie est nécessaire pour choisir une vidéo.");
      setBusy(false);
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.85,
    });
    setBusy(false);
    if (!res.canceled && res.assets[0]) {
      setPickedUri(res.assets[0].uri);
      setMode('video');
    }
  }, []);

  const publish = useCallback(() => {
    if (mode === 'none') {
      Alert.alert('Story', 'Choisis un type de story (photo, texte ou vidéo).');
      return;
    }
    if (mode === 'text' && !textBody.trim()) {
      Alert.alert('Texte', 'Écris quelque chose pour ta story.');
      return;
    }
    if ((mode === 'photo' || mode === 'video') && !pickedUri) {
      Alert.alert('Média', 'Choisis un fichier avant de publier.');
      return;
    }
    const id = `story-local-${Date.now()}`;
    const story: NewStoryPayload = {
      id,
      profileId: meProfileId,
      imageUri: mode === 'photo' ? pickedUri : null,
      videoUri: mode === 'video' ? pickedUri : null,
      text: mode === 'text' ? textBody.trim() : null,
    };
    onPublish(story);
    reset();
    modalRef.current?.dismiss();
  }, [meProfileId, mode, onPublish, pickedUri, reset, textBody, modalRef]);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={reset}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.inner}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={20}
        >
          <Text style={styles.title}>Créer une story</Text>

          <Pressable style={styles.opt} onPress={pickPhoto} disabled={busy}>
            <Text style={styles.optTxt}>📷 Photo depuis la galerie</Text>
          </Pressable>
          <Pressable style={styles.opt} onPress={() => setMode('text')} disabled={busy}>
            <Text style={styles.optTxt}>✏️ Texte</Text>
          </Pressable>
          <Pressable style={styles.opt} onPress={pickVideo} disabled={busy}>
            <Text style={styles.optTxt}>🎥 Vidéo</Text>
          </Pressable>

          {mode === 'text' ? (
            <BottomSheetTextInput
              value={textBody}
              onChangeText={setTextBody}
              placeholder="Ta story en texte..."
              placeholderTextColor={Colors.textMuted}
              multiline
              style={styles.textIn}
            />
          ) : null}

          {(mode === 'photo' || mode === 'video') && pickedUri ? (
            <Text style={styles.picked} numberOfLines={1}>
              Fichier sélectionné ✓
            </Text>
          ) : null}

          {busy ? <ActivityIndicator style={{ marginTop: 12 }} color={Colors.primary} /> : null}

          <Pressable onPress={publish} style={({ pressed }) => [styles.pub, pressed && { opacity: 0.92 }]}>
            <Text style={styles.pubTxt}>Publier</Text>
          </Pressable>
        </KeyboardAvoidingView>
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
  inner: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontFamily: Fonts.title.family, fontSize: 18, color: Colors.dark, marginBottom: 12, textAlign: 'center' },
  opt: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  optTxt: { fontFamily: Fonts.bodySemi.family, fontSize: 15, color: Colors.dark },
  textIn: {
    marginTop: 12,
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#0D0F2E',
  },
  picked: { marginTop: 10, fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
  pub: {
    marginTop: 18,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pubTxt: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: Colors.white },
});
