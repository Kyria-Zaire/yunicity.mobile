import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Fonts } from '@/constants/theme';

const MSG = '🚀 Post boosté ! Il sera vu par plus de Rémois';

type Props = {
  visible: boolean;
  onHidden: () => void;
};

export function BoosterToast({ visible, onHidden }: Props) {
  const { width } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      translateY.setValue(-24);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(-24);

    const enter = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }),
    ]);

    const exit = Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 420, useNativeDriver: true }),
    ]);

    enter.start(() => {
      setTimeout(() => {
        exit.start(({ finished }) => {
          if (finished) onHidden();
        });
      }, 1400);
    });
  }, [visible, opacity, translateY, onHidden]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onHidden}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.toast,
            {
              width: Math.min(width - 32, 360),
              marginTop: 60,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.txt}>{MSG}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  toast: {
    backgroundColor: '#0D0F2E',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  txt: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
