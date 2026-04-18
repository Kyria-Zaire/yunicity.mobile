import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';

type ButtonProps = PressableProps & {
  variant?: 'primary' | 'secondary' | 'outline';
  children: string;
};

export function Button({
  variant = 'primary',
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primary: { backgroundColor: '#2A2FFF' },
  secondary: { backgroundColor: '#0D0F2E' },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#2A2FFF' },
  pressed: { opacity: 0.85 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: '#fff' },
  secondaryText: { color: '#fff' },
  outlineText: { color: '#2A2FFF' },
});
