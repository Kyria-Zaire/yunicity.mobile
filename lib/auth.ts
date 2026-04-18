import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, registerApi, logoutApi } from './api';

export type User = {
  id: string;
  email: string;
  profileType?: string | undefined;
  name?: string | undefined;
  image?: string | undefined;
};

export async function signIn(
  email: string,
  password: string,
): Promise<User> {
  const { data, error } = await loginApi(email, password);
  if (error || !data) {
    throw new Error(error ?? 'Connexion impossible');
  }
  await AsyncStorage.setItem('yunicity_session', data.token);
  await AsyncStorage.setItem('yunicity_user', JSON.stringify(data.user));
  return data.user as User;
}

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<User> {
  const { data, error } = await registerApi({
    email,
    password,
    name: name ?? '',
    profileType: 'yunicitizen',
  });
  if (error || !data) {
    throw new Error(error ?? "Erreur d'inscription");
  }
  return { id: data.id, email: data.email };
}

export async function signOut(): Promise<void> {
  await logoutApi();
}
