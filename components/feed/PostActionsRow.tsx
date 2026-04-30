import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';

type Props = {
  commentCount: number;
  shareCount: number;
  likeCount: number;
  liked: boolean;
  heartScale: Animated.Value;
  onPressComments: () => void;
  onPressLike: () => void;
  onPressShare: () => void;
  onPressRepost?: () => void;
};

export function PostActionsRow({
  commentCount,
  shareCount,
  likeCount,
  liked,
  heartScale,
  onPressComments,
  onPressLike,
  onPressShare,
  onPressRepost,
}: Props) {
  return (
    <View style={styles.actions}>
      <Pressable style={styles.actionBtn} onPress={onPressComments}>
        <Ionicons name="chatbubble-outline" size={20} color={Colors.gray} />
        <Text style={styles.actionCount}>{commentCount}</Text>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={() => onPressRepost?.()}>
        <Ionicons name="repeat-outline" size={20} color={Colors.gray} />
        <Text style={styles.actionCount}>{shareCount}</Text>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={onPressLike}>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#E11D48' : Colors.gray} />
        </Animated.View>
        <Text style={[styles.actionCount, liked && { color: '#E11D48' }]}>{likeCount}</Text>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={onPressShare}>
        <Ionicons name="share-social-outline" size={20} color={Colors.gray} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 56 },
  actionCount: { fontFamily: Fonts.body.family, fontSize: 13, color: Colors.gray },
});
