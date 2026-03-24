export interface SireneResult {
  valid: boolean;
  active: boolean;
  businessName?: string | undefined;
  address?: string | undefined;
}

interface SireneApiResponse {
  etablissement?: {
    siret: string;
    etatAdministratifEtablissement?: string;
    uniteLegale?: {
      denominationUniteLegale?: string;
      etatAdministratifUniteLegale?: string;
    };
    adresseEtablissement?: {
      numeroVoieEtablissement?: string;
      libelleVoieEtablissement?: string;
      codeCommuneEtablissement?: string;
    };
  };
}

export async function verifySIRET(siret: string): Promise<SireneResult> {
  const clean = siret.replace(/[\s\-]/g, '');
  if (!/^\d{14}$/.test(clean)) return { valid: false, active: false };

  try {
    const response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${clean}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Yunicity/1.0 (contact@yunicity.fr)',
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.status === 404) return { valid: false, active: false };

    if (!response.ok) {
      // API Sirene indisponible → fallback review manuelle
      console.warn(
        `Sirene API indisponible (${response.status}) → review manuelle`,
      );
      return { valid: true, active: true };
    }

    const data = (await response.json()) as SireneApiResponse;
    const etab = data.etablissement;
    if (!etab) return { valid: false, active: false };

    const isActive = etab.etatAdministratifEtablissement === 'A';
    const name = etab.uniteLegale?.denominationUniteLegale;
    const addr = [
      etab.adresseEtablissement?.numeroVoieEtablissement,
      etab.adresseEtablissement?.libelleVoieEtablissement,
      etab.adresseEtablissement?.codeCommuneEtablissement,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      valid: true,
      active: isActive,
      businessName: name,
      address: addr || undefined,
    };
  } catch (err) {
    console.error('Sirene fetch error:', err);
    return { valid: true, active: true }; // Fallback review manuelle
  }
}
