import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
} from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#6B7280"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#0D0F2E' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: { borderColor: '#DC2626' },
  error: { fontSize: 12, color: '#DC2626', marginTop: 4 },
});
