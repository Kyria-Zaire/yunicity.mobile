import AsyncStorage from '@react-native-async-storage/async-storage';

/** Envoi best-effort (ne bloque pas l’UI). */
export async function submitPostCommentBestEffort(postId: string, text: string): Promise<void> {
  try {
    const base = process.env.EXPO_PUBLIC_API_URL;
    if (!base || !text.trim()) return;
    const token = await AsyncStorage.getItem('yunicity_session');
    await fetch(`${base}/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text: text.trim() }),
    });
  } catch {
    /* ignore */
  }
}
