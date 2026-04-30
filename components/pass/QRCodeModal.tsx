import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

const QR_SIZE = 200;
const GRID = 25;

type Props = {
  visible: boolean;
  onClose: () => void;
  qrPayload: string;
  displayName: string;
  levelName: string;
};

function hashBit(seed: string, row: number, col: number) {
  const value = `${seed}:${row}:${col}`;
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return (hash & 1) === 1;
}

function finder(offsetX: number, offsetY: number, cell: number) {
  const cells: { x: number; y: number; size: number }[] = [];

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const border = row === 0 || col === 0 || row === 6 || col === 6;
      const core = row >= 2 && row <= 4 && col >= 2 && col <= 4;

      if (border || core) {
        cells.push({
          x: offsetX + row * cell,
          y: offsetY + col * cell,
          size: cell,
        });
      }
    }
  }

  return cells.map((item, index) => (
    <View
      key={`finder-${offsetX}-${offsetY}-${index}`}
      style={[styles.qrCell, { left: item.x, top: item.y, width: item.size, height: item.size }]}
    />
  ));
}

export function QRCodeModal({ visible, onClose, qrPayload, displayName, levelName }: Props) {
  const cell = QR_SIZE / GRID;

  const modules = useMemo(() => {
    const values: { key: string; x: number; y: number; on: boolean }[] = [];

    for (let row = 0; row < GRID; row += 1) {
      for (let col = 0; col < GRID; col += 1) {
        const insideFinder =
          (row < 7 && col < 7) ||
          (row < 7 && col >= GRID - 7) ||
          (row >= GRID - 7 && col < 7);

        if (insideFinder) continue;

        values.push({
          key: `${row}-${col}`,
          x: row * cell,
          y: col * cell,
          on: hashBit(qrPayload, row, col),
        });
      }
    }

    return values;
  }, [cell, qrPayload]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Mon QR Code</Text>
          <Text style={styles.subtitle}>Présentez ce code chez nos partenaires</Text>

          <View style={styles.qrShell}>
            <View style={styles.qrInner}>
              {finder(0, 0, cell)}
              {finder(0, (GRID - 7) * cell, cell)}
              {finder((GRID - 7) * cell, 0, cell)}
              {modules.map((module) => (
                <View
                  key={module.key}
                  style={[
                    styles.qrCell,
                    {
                      left: module.x,
                      top: module.y,
                      width: cell,
                      height: cell,
                      opacity: module.on ? 1 : 0,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.code}>{qrPayload}</Text>
          <Text style={styles.nameLine}>
            {displayName} · {levelName}
          </Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,15,46,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.title.family,
    fontSize: 20,
    color: Colors.dark,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontFamily: Fonts.body.family,
    fontSize: 13,
    color: Colors.gray,
    textAlign: 'center',
  },
  qrShell: {
    marginTop: 24,
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: 16,
    backgroundColor: Colors.dark,
    padding: 12,
  },
  qrInner: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  qrCell: {
    position: 'absolute',
    backgroundColor: Colors.dark,
  },
  code: {
    marginTop: 18,
    fontFamily: Fonts.mono.family,
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  nameLine: {
    marginTop: 6,
    fontFamily: Fonts.bodySemi.family,
    fontSize: 14,
    color: Colors.textBody,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 24,
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemi.family,
    fontSize: 16,
    color: Colors.white,
  },
});
