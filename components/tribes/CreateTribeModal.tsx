import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetModal as BottomSheetModalType } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radii } from '@/constants/theme';
import { TRIBE_CATEGORIES, type Tribe } from '@/constants/mockTribes';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (tribe: Tribe) => void;
};

const QUARTIERS = ['Centre', 'Croix-Rouge', 'Clairmarais', 'Jean-Jaurès', 'Autre'] as const;

function makeId() {
  return `t${Date.now().toString().slice(-6)}`;
}

export function CreateTribeModal({ visible, onClose, onCreate }: Props) {
  const modalRef = useRef<BottomSheetModalType | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('sport');
  const [description, setDescription] = useState('');
  const [quartier, setQuartier] = useState<string>('Centre');
  const [isPublic, setIsPublic] = useState(true);

  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (visible) modalRef.current?.present();
    else modalRef.current?.dismiss();
  }, [visible]);

  const reset = () => {
    setName('');
    setCategory('sport');
    setDescription('');
    setQuartier('Centre');
    setIsPublic(true);
  };

  const close = () => {
    modalRef.current?.dismiss();
  };

  const submit = () => {
    const safeName = name.trim();
    const safeDescription = description.trim();
    if (!safeName || !safeDescription) return;

    const chosenCategory = TRIBE_CATEGORIES.find((item) => item.id === category);
    const newTribe: Tribe = {
      id: makeId(),
      name: safeName,
      description: safeDescription,
      category,
      emoji: chosenCategory?.emoji ?? '🏘️',
      color: '#2A2FFF',
      coverUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=800',
      members: 1,
      activeToday: 1,
      postsToday: 0,
      activityLevel: 'active',
      isPublic,
      quartier,
      badges: ['🚀 Nouvelle tribu'],
      rules: ['Respecter la communauté', 'Participer avec bienveillance', 'Partager des infos utiles'],
      moderators: ['u1'],
      isMember: true,
      isFounder: true,
      stats: { actions: 0, events: 0, votes: 0 },
    };

    onCreate(newTribe);
    reset();
    close();
  };

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={() => {
        reset();
        onClose();
      }}
      backdropComponent={(props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} />
      )}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer une tribu</Text>
          <Pressable onPress={close} style={styles.close}>
            <Ionicons name="close" size={20} color={Colors.dark} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.counter}>{name.length}/50</Text>
          </View>
          <BottomSheetTextInput
            value={name}
            onChangeText={(value) => setName(value.slice(0, 50))}
            placeholder="Nom de la tribu"
            placeholderTextColor={Colors.gray}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Catégorie</Text>
          <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {TRIBE_CATEGORIES.filter((item) => item.id !== 'all').map((item) => {
              const active = item.id === category;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCategory(item.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.emoji} {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.counter}>{description.length}/300</Text>
          </View>
          <BottomSheetTextInput
            value={description}
            onChangeText={(value) => setDescription(value.slice(0, 300))}
            placeholder="Décris l'énergie et l'utilité de ta tribu..."
            placeholderTextColor={Colors.gray}
            multiline
            style={styles.textarea}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Quartier</Text>
          <View style={styles.quartierGrid}>
            {QUARTIERS.map((item) => {
              const active = item === quartier;
              return (
                <Pressable
                  key={item}
                  onPress={() => setQuartier(item)}
                  style={[styles.quartierChip, active && styles.quartierChipActive]}
                >
                  <Text style={[styles.quartierText, active && styles.quartierTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Visibilité</Text>
          <View style={styles.visibilityCard}>
            <View style={styles.visibilityHeader}>
              <View>
                <Text style={styles.visibilityTitle}>{isPublic ? 'Publique' : 'Privée'}</Text>
                <Text style={styles.visibilityText}>
                  {isPublic
                    ? 'Tout le monde peut découvrir et rejoindre ta tribu.'
                    : 'Seulement les membres invités peuvent entrer.'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isPublic ? Colors.primary : '#FFFFFF'}
              />
            </View>
            <View style={styles.visibilityToggle}>
              <Pressable
                onPress={() => setIsPublic(true)}
                style={[styles.visibilityPill, isPublic && styles.visibilityPillActive]}
              >
                <Text style={[styles.visibilityPillText, isPublic && styles.visibilityPillTextActive]}>Publique</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsPublic(false)}
                style={[styles.visibilityPill, !isPublic && styles.visibilityPillActive]}
              >
                <Text style={[styles.visibilityPillText, !isPublic && styles.visibilityPillTextActive]}>Privée</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable onPress={submit} disabled={!name.trim() || !description.trim()} style={styles.submitWrap}>
          <LinearGradient
            colors={!name.trim() || !description.trim() ? ['#9CA3AF', '#6B7280'] : ['#2A2FFF', '#7C3AED']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.submit}
          >
            <Text style={styles.submitText}>Créer ma tribu 🚀</Text>
          </LinearGradient>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

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
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.dark,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  counter: {
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
  },
  textarea: {
    minHeight: 112,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: 'top',
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#EEF2FF',
  },
  chipText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  chipTextActive: {
    color: Colors.primary,
  },
  quartierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quartierChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  quartierChipActive: {
    backgroundColor: '#EEF2FF',
  },
  quartierText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  quartierTextActive: {
    color: Colors.primary,
  },
  visibilityCard: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    padding: 14,
    gap: 12,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  visibilityTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  visibilityText: {
    marginTop: 4,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    maxWidth: 250,
  },
  visibilityToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  visibilityPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
  },
  visibilityPillText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.gray,
  },
  visibilityPillTextActive: {
    color: Colors.primary,
  },
  submitWrap: {
    marginTop: 8,
  },
  submit: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 15,
    color: Colors.white,
  },
});
