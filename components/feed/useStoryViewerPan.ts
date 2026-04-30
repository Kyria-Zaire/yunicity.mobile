import { useMemo } from 'react';
import { PanResponder } from 'react-native';

/** Déplacement max (px) pour considérer un tap plutôt qu’un swipe. */
const TAP_MOVE_MAX = 14;
/** Distance horizontale min. (px) pour valider un swipe. */
const SWIPE_DISTANCE_MIN = 52;
/** Vélocité horizontale min. pour valider un swipe même si la distance est courte. */
const SWIPE_VELOCITY_MIN = 320;

export type StoryViewerPanHandlers = {
  /** Moitié gauche de l’écran : story précédente (même utilisateur). */
  onTapLeft: () => void;
  /** Moitié droite : story suivante (même utilisateur). */
  onTapRight: () => void;
  /** Doigt vers la gauche (dx négatif) : utilisateur suivant dans la barre. */
  onSwipeToNextRing: () => void;
  /** Doigt vers la droite : utilisateur précédent. */
  onSwipeToPrevRing: () => void;
};

/**
 * Pan plein écran : tap gauche/droite = slides, swipe horizontal = changement d’anneau.
 * Les vues média doivent avoir `pointerEvents="none"` pour que les touches atteignent la couche gestuelle.
 */
export function useStoryViewerPan(
  screenWidth: number,
  { onTapLeft, onTapRight, onSwipeToNextRing, onSwipeToPrevRing }: StoryViewerPanHandlers,
) {
  return useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, g) => {
          const mostlyHorizontal = Math.abs(g.dx) >= Math.abs(g.dy);
          const smallMove = Math.abs(g.dx) < TAP_MOVE_MAX && Math.abs(g.dy) < TAP_MOVE_MAX;

          if (smallMove) {
            if (g.moveX < screenWidth / 2) onTapLeft();
            else onTapRight();
            return;
          }

          if (!mostlyHorizontal) return;

          if (g.dx <= -SWIPE_DISTANCE_MIN || g.vx <= -SWIPE_VELOCITY_MIN) {
            onSwipeToNextRing();
          } else if (g.dx >= SWIPE_DISTANCE_MIN || g.vx >= SWIPE_VELOCITY_MIN) {
            onSwipeToPrevRing();
          }
        },
      }),
    [screenWidth, onTapLeft, onTapRight, onSwipeToNextRing, onSwipeToPrevRing],
  );
}
