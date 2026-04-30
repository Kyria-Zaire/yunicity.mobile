export function getErrorMessage(status: number, code?: string): string {
  if (code === 'RATE_LIMITED')
    return 'Trop de tentatives. Attends 15 minutes.';
  if (code === 'INVALID_OTP')
    return 'Code incorrect. Vérifie ton email.';
  if (code === 'EXPIRED_OTP')
    return 'Code expiré. Demande un nouveau code.';

  switch (status) {
    case 0:
      return 'Pas de connexion internet.';
    case 401:
      return 'Email ou mot de passe incorrect.';
    case 403:
      return 'Accès refusé.';
    case 422:
      return 'Vérifie les informations saisies.';
    case 423:
      return 'Compte temporairement bloqué.';
    case 429:
      return 'Trop de tentatives. Attends 15 minutes.';
    case 500:
      return 'Problème technique. Réessaie.';
    case 503:
      return 'Service indisponible. Réessaie.';
    default:
      return 'Une erreur est survenue. Réessaie.';
  }
}

