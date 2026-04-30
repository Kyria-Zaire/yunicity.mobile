import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

interface Props {
  thumbnailUrl: string;
  style?: ViewStyle;
  rounded?: number;
}

export function VideoThumbnail({ thumbnailUrl, style, rounded = 16 }: Props) {
  return (
    <View style={[styles.wrap, { borderRadius: rounded }, style]}>
      <Image source={{ uri: thumbnailUrl }} style={[styles.img, { borderRadius: rounded }]} resizeMode="cover" />
      <View style={[styles.overlay, { borderRadius: rounded }]}>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={22} color="#0D0F2E" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

