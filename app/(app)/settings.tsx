import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileByIdOrFallback } from '@/components/profile/profileUtils';
import { useApi } from '@/hooks/useApi';
import { Colors, Fonts, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfilingCategory = { id: string; label: string; emoji: string; color: string };
type ProfilingConfig = { title: string; subtitle: string; emoji: string; categories: ProfilingCategory[] };

const PROFILING_DATA: Record<string, ProfilingConfig> = {
  yunicitizen: {
    title: "Qu'est-ce qui t'anime ?",
    subtitle: "Choisis tes centres d'intérêt pour personnaliser ton expérience",
    emoji: '🌍',
    categories: [
      { id: 'jazz', label: 'Jazz & Musique', emoji: '🎷', color: '#D97706' },
      { id: 'velo', label: 'Vélo & Mobilité', emoji: '🚴', color: '#16A34A' },
      { id: 'gastro', label: 'Gastronomie', emoji: '🍽️', color: '#DC2626' },
      { id: 'ecologie', label: 'Écologie', emoji: '🌱', color: '#059669' },
      { id: 'culture', label: 'Culture & Art', emoji: '🎭', color: '#7C3AED' },
      { id: 'sport', label: 'Sport', emoji: '⚡', color: '#16A34A' },
      { id: 'champagne', label: 'Champagne', emoji: '🍾', color: '#D97706' },
      { id: 'photo', label: 'Photographie', emoji: '📸', color: '#0891B2' },
      { id: 'business', label: 'Business', emoji: '💼', color: '#2A2FFF' },
      { id: 'tech', label: 'Tech & Innovation', emoji: '💻', color: '#0891B2' },
      { id: 'famille', label: 'Famille', emoji: '👨‍👩‍👧', color: '#F59E0B' },
      { id: 'solidarite', label: 'Solidarité', emoji: '🤝', color: '#2A2FFF' },
    ],
  },
  commercial: {
    title: "Votre secteur d'activité",
    subtitle: 'Personnalisez votre vitrine et vos recommandations partenaires',
    emoji: '🏪',
    categories: [
      { id: 'resto', label: 'Restauration', emoji: '🍽️', color: '#DC2626' },
      { id: 'bienettre', label: 'Bien-être & Beauté', emoji: '💆', color: '#D97706' },
      { id: 'commerce', label: 'Commerce & Retail', emoji: '🛍️', color: '#2A2FFF' },
      { id: 'services', label: 'Services', emoji: '⚙️', color: '#6B7280' },
      { id: 'culture', label: 'Culture & Loisirs', emoji: '🎭', color: '#7C3AED' },
      { id: 'artisanat', label: 'Artisanat', emoji: '🔨', color: '#B45309' },
      { id: 'sante', label: 'Santé', emoji: '🏥', color: '#16A34A' },
      { id: 'immobilier', label: 'Immobilier', emoji: '🏠', color: '#0891B2' },
    ],
  },
  association: {
    title: "Votre domaine d'action",
    subtitle: 'Connectez-vous aux bons réseaux et événements',
    emoji: '🤝',
    categories: [
      { id: 'culture', label: 'Culture', emoji: '🎭', color: '#7C3AED' },
      { id: 'sport', label: 'Sport', emoji: '⚽', color: '#16A34A' },
      { id: 'solidarite', label: 'Solidarité', emoji: '❤️', color: '#DC2626' },
      { id: 'environnement', label: 'Environnement', emoji: '🌱', color: '#059669' },
      { id: 'education', label: 'Éducation', emoji: '📚', color: '#2A2FFF' },
      { id: 'sante', label: 'Santé', emoji: '🏥', color: '#16A34A' },
      { id: 'jeunesse', label: 'Jeunesse', emoji: '👦', color: '#F59E0B' },
      { id: 'patrimoine', label: 'Patrimoine', emoji: '🏛️', color: '#D97706' },
    ],
  },
  freelance: {
    title: "Votre domaine d'expertise",
    subtitle: 'Trouvez des clients et collaborateurs qui vous correspondent',
    emoji: '💼',
    categories: [
      { id: 'design', label: 'Design & Créa', emoji: '🎨', color: '#7C3AED' },
      { id: 'dev', label: 'Développement', emoji: '💻', color: '#0891B2' },
      { id: 'photo', label: 'Photo & Vidéo', emoji: '📸', color: '#DC2626' },
      { id: 'marketing', label: 'Marketing & Com', emoji: '📣', color: '#D97706' },
      { id: 'conseil', label: 'Conseil & Strat', emoji: '🧠', color: '#2A2FFF' },
      { id: 'redaction', label: 'Rédaction', emoji: '✍️', color: '#059669' },
      { id: 'formation', label: 'Formation', emoji: '🎓', color: '#F59E0B' },
      { id: 'artisanat', label: 'Artisanat & Art', emoji: '🔨', color: '#B45309' },
    ],
  },
  ecole: {
    title: 'Votre établissement',
    subtitle: 'Connectez-vous aux ressources et événements adaptés',
    emoji: '📚',
    categories: [
      { id: 'primaire', label: 'Primaire', emoji: '🎒', color: '#F59E0B' },
      { id: 'college', label: 'Collège', emoji: '📖', color: '#16A34A' },
      { id: 'lycee', label: 'Lycée', emoji: '🎓', color: '#2A2FFF' },
      { id: 'superieur', label: 'Supérieur', emoji: '🏛️', color: '#7C3AED' },
      { id: 'pro', label: 'Formation Pro', emoji: '💼', color: '#0891B2' },
      { id: 'arts', label: 'Arts & Culture', emoji: '🎭', color: '#DC2626' },
      { id: 'sport', label: 'Sport & EPS', emoji: '⚽', color: '#16A34A' },
      { id: 'sciences', label: 'Sciences & Tech', emoji: '🔬', color: '#059669' },
    ],
  },
};

function profilingConfigFor(profileType: string | undefined | null): ProfilingConfig {
  return PROFILING_DATA[profileType ?? ''] ?? PROFILING_DATA['yunicitizen'];
}

const QUARTIERS = ['Centre', 'Croix-Rouge', 'Clairmarais', 'Jean-Jaures', 'Autre'] as const;

function fallbackBio(profile: ReturnType<typeof profileByIdOrFallback>) {
  return 'bio' in profile ? profile.bio : `${profile.name} sur Yunicity`;
}

function fallbackQuartier(profile: ReturnType<typeof profileByIdOrFallback>) {
  return 'quartier' in profile ? profile.quartier : 'Centre';
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const setHideTabBar = useUIStore((state) => state.setHideTabBar);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const fallback = useMemo(() => profileByIdOrFallback('u1'), []);

  const meQuery = useApi(async () => {
    if (!user?.id) return null;
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
      headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
    });
    if (!res.ok) throw new Error('Impossible de charger le profil');
    return (await res.json()) as {
      profileData?: { displayName?: string; bio?: string };
    };
  }, [user?.id]);

  const [displayName, setDisplayName] = useState(user?.profileData?.displayName ?? fallback.name);
  const [bio, setBio] = useState(fallbackBio(fallback));
  const [quartier, setQuartier] = useState(fallbackQuartier(fallback));
  const [notifications, setNotifications] = useState({
    tribes: true,
    events: true,
    followers: false,
    comments: true,
  });
  const [legalModal, setLegalModal] = useState<'cgu' | 'privacy' | null>(null);
  const [showProfilingFilter, setShowProfilingFilter] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setHideTabBar(true);
      // Charger les intérêts à chaque retour Settings
      AsyncStorage.getItem('yunicity_interests')
        .then((raw) => {
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) setInterests(parsed.filter((x) => typeof x === 'string'));
        })
        .catch(() => {});
      return () => setHideTabBar(false);
    }, [setHideTabBar]),
  );

  useEffect(() => {
    if (meQuery.data?.profileData?.displayName) {
      setDisplayName(meQuery.data.profileData.displayName);
    }
    if (meQuery.data?.profileData?.bio) {
      setBio(meQuery.data.profileData.bio);
    }
  }, [meQuery.data]);

  const save = async () => {
    if (!user?.id) return;

    const nextUser = {
      ...user,
      profileData: { ...user.profileData, displayName },
    };

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id },
        body: JSON.stringify({
          profileData: { displayName, bio },
          quartier,
        }),
      });

      setUser(nextUser);

      if (!res.ok) {
        Alert.alert('Mode demo', 'Modifications enregistrees localement.');
        return;
      }

      Alert.alert('Profil', 'Modifications enregistrees.');
    } catch {
      setUser(nextUser);
      Alert.alert('Mode demo', 'Modifications enregistrees localement.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.dark} />
          </Pressable>
          <Text style={styles.headerTitle}>Parametres</Text>
          <View style={styles.iconBtnGhost} />
        </View>

        <Section title="Mon compte">
          <View style={styles.avatarRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>👤</Text>
            </View>
            <Text style={styles.avatarHint}>Photo de profil</Text>
          </View>

          <Label label="Nom affiche" />
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            placeholder="Nom affiche"
          />

          <Label label="Bio" />
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={styles.textarea}
            multiline
            placeholder="Decris qui tu es sur Yunicity"
            textAlignVertical="top"
          />

          <Label label="Quartier" />
          <View style={styles.chipsWrap}>
            {QUARTIERS.map((item) => {
              const active = item === quartier;
              return (
                <Pressable
                  key={item}
                  onPress={() => setQuartier(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={save} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Enregistrer</Text>
          </Pressable>

          <MenuRow
            label="🎯 Mes centres d'intérêt"
            subLabel={
              interests.length
                ? interests.slice(0, 3).join(' · ')
                : "Aucun centre d'intérêt sélectionné"
            }
            onPress={() => setShowProfilingFilter(true)}
          />
        </Section>

        <Section title="Notifications">
          <ToggleRow
            label="Nouveaux posts dans mes tribus"
            value={notifications.tribes}
            onValueChange={(value) => setNotifications((state) => ({ ...state, tribes: value }))}
          />
          <ToggleRow
            label="Evenements pres de moi"
            value={notifications.events}
            onValueChange={(value) => setNotifications((state) => ({ ...state, events: value }))}
          />
          <ToggleRow
            label="Quelqu'un m'a suivi"
            value={notifications.followers}
            onValueChange={(value) =>
              setNotifications((state) => ({ ...state, followers: value }))
            }
          />
          <ToggleRow
            label="Reponse a mes commentaires"
            value={notifications.comments}
            onValueChange={(value) =>
              setNotifications((state) => ({ ...state, comments: value }))
            }
          />
        </Section>

        <Section title="Abonnement">
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>
              Niveau actuel : Passeport {fallback.type === 'commercial' ? 'Business' : 'Basic'}
            </Text>
            <Text style={styles.premiumText}>
              Debloque plus d'avantages, de recommandations et d'acces prioritaires.
            </Text>
            <Pressable
              onPress={() => Alert.alert('Premium', 'Premium bientot disponible !')}
            >
              <Text style={styles.premiumLink}>Passer Premium →</Text>
            </Pressable>
          </View>
        </Section>

        <Section title="Confidentialite">
          <MenuRow
            label="Conditions generales d'utilisation"
            onPress={() => setLegalModal('cgu')}
          />
          <MenuRow
            label="Politique de confidentialite"
            onPress={() => setLegalModal('privacy')}
          />
        </Section>

        <Section title="RGPD">
          <MenuRow
            label="Telecharger mes donnees"
            onPress={() =>
              Alert.alert('RGPD', 'Telechargement de tes donnees bientot disponible.')
            }
          />
          <MenuRow
            label="Supprimer mon compte"
            destructive
            onPress={() =>
              Alert.alert('Supprimer mon compte', 'Cette action sera bientot disponible.', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Compris', style: 'destructive' },
              ])
            }
          />
        </Section>

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Se deconnecter</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={legalModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLegalModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {legalModal === 'cgu'
                ? "Conditions generales d'utilisation"
                : 'Politique de confidentialite'}
            </Text>
            <Text style={styles.modalBody}>
              {legalModal === 'cgu'
                ? 'Document de demonstration. Les CGU completes seront integrees avec le contenu juridique final.'
                : 'Document de demonstration. La politique de confidentialite complete sera integree avec le contenu juridique final.'}
            </Text>
            <Pressable onPress={() => setLegalModal(null)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {showProfilingFilter ? (
        <ProfilingFilterModal
          profileType={(user as any)?.profileType ?? 'yunicitizen'}
          userId={user?.id ?? null}
          onClose={async () => {
            setShowProfilingFilter(false);
            try {
              const raw = await AsyncStorage.getItem('yunicity_interests');
              const parsed = raw ? JSON.parse(raw) : [];
              if (Array.isArray(parsed)) setInterests(parsed.filter((x) => typeof x === 'string'));
            } catch {}
          }}
        />
      ) : null}
    </View>
  );
}

function ProfilingFilterModal({
  profileType,
  userId,
  onClose,
}: {
  profileType: string;
  userId: string | null;
  onClose: () => void;
}) {
  const cfg = useMemo(() => profilingConfigFor(profileType), [profileType]);
  const [selected, setSelected] = useState<string[]>([]);
  const translateY = useRef(new Animated.Value(900)).current;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem('yunicity_interests');
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (mounted && Array.isArray(parsed)) {
          setSelected(parsed.filter((x) => typeof x === 'string') as string[]);
        }
      } catch {}
    };
    load();
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }).start();
    return () => {
      mounted = false;
    };
  }, [translateY]);

  const close = useCallback(() => {
    Animated.timing(translateY, { toValue: 900, duration: 220, useNativeDriver: true }).start(() => onClose());
  }, [onClose, translateY]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const canSubmit = selected.length >= 3;

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    const payload = selected.slice(0, 24);
    await AsyncStorage.setItem('yunicity_interests', JSON.stringify(payload));
    if (userId) {
      try {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
          body: JSON.stringify({ profileData: { interests: payload } }),
        });
      } catch {}
    }
    close();
  }, [canSubmit, close, selected, userId]);

  return (
    <View style={profilingStyles.root} pointerEvents="box-none">
      <Pressable style={profilingStyles.backdrop} onPress={close} />
      <Animated.View style={[profilingStyles.card, { transform: [{ translateY }] }]}>
        <View style={profilingStyles.handle} />

        <View style={profilingStyles.head}>
          <View style={[profilingStyles.heroEmojiWrap, { backgroundColor: 'rgba(42,47,255,0.10)' }]}>
            <Text style={profilingStyles.heroEmoji}>{cfg.emoji}</Text>
          </View>
          <Text style={profilingStyles.title}>{cfg.title}</Text>
          <Text style={profilingStyles.subtitle}>{cfg.subtitle}</Text>
          <Text style={[profilingStyles.counter, canSubmit && { color: '#16A34A' }]}>
            {canSubmit ? `✓ ${selected.length} sélectionnés` : `${selected.length} sélectionnés · min 3`}
          </Text>
        </View>

        <ScrollView contentContainerStyle={profilingStyles.grid} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {cfg.categories.map((item) => {
              const isOn = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  style={[
                    profilingStyles.tag,
                    isOn && { borderColor: item.color, borderWidth: 2, backgroundColor: `${item.color}14` },
                  ]}
                >
                  {isOn ? (
                    <View style={[profilingStyles.check, { backgroundColor: item.color }]}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : null}
                  <View style={[profilingStyles.tagEmojiWrap, { backgroundColor: `${item.color}22` }]}>
                    <Text style={profilingStyles.tagEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={profilingStyles.tagLabel}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={profilingStyles.footer}>
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[profilingStyles.cta, !canSubmit && { backgroundColor: '#E5E7EB' }]}
          >
            <Text style={[profilingStyles.ctaText, !canSubmit && { color: '#9CA3AF' }]}>
              Personnaliser mon expérience 🚀
            </Text>
          </Pressable>
          <Pressable onPress={close} hitSlop={10}>
            <Text style={profilingStyles.skip}>Passer pour l'instant</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Label({ label }: { label: string }) {
  return <Text style={styles.label}>{label}</Text>;
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
        thumbColor={value ? Colors.primary : Colors.white}
      />
    </View>
  );
}

function MenuRow({
  label,
  onPress,
  destructive,
  subLabel,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  subLabel?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>{label}</Text>
        {subLabel ? <Text style={styles.menuSubLabel}>{subLabel}</Text> : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={destructive ? '#DC2626' : Colors.gray}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  iconBtnGhost: {
    width: 36,
  },
  headerTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.dark,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: Fonts.titleSemi.family,
    fontSize: 16,
    color: Colors.dark,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    ...Shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 24,
  },
  avatarHint: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.dark,
  },
  label: {
    marginBottom: 6,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 13,
    color: Colors.dark,
  },
  input: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 14,
  },
  textarea: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.body.family,
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 14,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
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
  primaryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 15,
    color: Colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: {
    flex: 1,
    paddingRight: 12,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  premiumCard: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    padding: 14,
  },
  premiumTitle: {
    fontFamily: Fonts.titleSemi.family,
    fontSize: 15,
    color: Colors.dark,
  },
  premiumText: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.gray,
  },
  premiumLink: {
    marginTop: 12,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.primary,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLabel: {
    fontFamily: Fonts.body.family,
    fontSize: 14,
    color: Colors.dark,
  },
  menuSubLabel: {
    marginTop: 2,
    fontFamily: Fonts.body.family,
    fontSize: 12,
    color: Colors.gray,
  },
  menuLabelDestructive: {
    color: '#DC2626',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontFamily: Fonts.bodyBold.family,
    fontSize: 15,
    color: '#DC2626',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontFamily: Fonts.title.family,
    fontSize: 18,
    color: Colors.dark,
  },
  modalBody: {
    marginTop: 10,
    fontFamily: Fonts.body.family,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textBody,
  },
});

const profilingStyles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  card: {
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  head: { paddingHorizontal: 18, alignItems: 'center', paddingBottom: 10 },
  heroEmojiWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroEmoji: { fontSize: 40 },
  title: { fontFamily: Fonts.title.family, fontSize: 24, color: Colors.dark, textAlign: 'center' },
  subtitle: { marginTop: 6, fontFamily: Fonts.body.family, fontSize: 14, color: Colors.gray, textAlign: 'center' },
  counter: { marginTop: 10, fontFamily: Fonts.bodyMedium.family, fontSize: 13, color: Colors.gray },
  grid: { paddingHorizontal: 18, paddingBottom: 160, paddingTop: 6 },
  tag: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    minHeight: 74,
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagEmojiWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tagEmoji: { fontSize: 18 },
  tagLabel: { marginTop: 10, fontFamily: Fonts.titleSemi.family, fontSize: 14, color: Colors.dark },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
  },
  cta: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: Fonts.titleSemi.family, fontSize: 16, color: '#fff' },
  skip: { marginTop: 12, textAlign: 'center', fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
});
