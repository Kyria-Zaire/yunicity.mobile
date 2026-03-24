import { env } from '../config/env.js';

// Interface stable — ne changera PAS quand Yuni AI sera branche
export interface Recommendation {
  id: string;
  type: 'actor' | 'tribe' | 'event';
  name: string;
  reason: string;
  score: number;
  city: string;
}

export interface RecommendationResult {
  actors: Recommendation[];
  tribes: Recommendation[];
  reason: string;
  source: 'yuni_ai' | 'geographic_fallback' | 'stub';
}

// Donnees mock stables pour le dev et les tests
const MOCK_RECOMMENDATIONS: RecommendationResult = {
  source: 'stub',
  reason:
    'Decouvrez les acteurs de Reims — recommandations personnalisees bientot disponibles',
  actors: [
    {
      id: 'mock-1',
      type: 'actor',
      name: 'Boulangerie du Marche',
      reason: 'Commerce populaire pres de vous',
      score: 0.95,
      city: 'reims',
    },
    {
      id: 'mock-2',
      type: 'actor',
      name: 'Studio Photo Remois',
      reason: 'Freelance creatif dans votre ville',
      score: 0.88,
      city: 'reims',
    },
    {
      id: 'mock-3',
      type: 'actor',
      name: 'Asso Jazz au Parvis',
      reason: 'Association culturelle active',
      score: 0.82,
      city: 'reims',
    },
  ],
  tribes: [
    {
      id: 'mock-t1',
      type: 'tribe',
      name: 'Cyclistes de Reims',
      reason: 'Tribu sport populaire',
      score: 0.91,
      city: 'reims',
    },
    {
      id: 'mock-t2',
      type: 'tribe',
      name: 'Entrepreneurs Reims',
      reason: 'Reseau business local',
      score: 0.85,
      city: 'reims',
    },
  ],
};

export class RecommendationService {
  /**
   * Point d'entree principal — delegue a Yuni AI si disponible,
   * sinon fallback geographique, sinon stub de dev.
   */
  static async getRecommendations(params: {
    userId: string;
    city: string;
    limit?: number | undefined;
  }): Promise<RecommendationResult> {
    // 1. Tenter Yuni AI si configure
    if (env.YUNI_AI_URL) {
      const yuniResult =
        await RecommendationService.callYuniAI(params);
      if (yuniResult) return yuniResult;
    }

    // 2. Fallback geographique
    const geoResult =
      await RecommendationService.getGeographicFallback(params.city);
    if (geoResult.actors.length > 0 || geoResult.tribes.length > 0) {
      return geoResult;
    }

    // 3. Stub de dev — toujours disponible
    return MOCK_RECOMMENDATIONS;
  }

  /**
   * Delegation vers Yuni AI (microservice externe futur).
   * AbortSignal.timeout(3000) : si Yuni AI ne repond pas en 3s → null → fallback.
   */
  private static async callYuniAI(params: {
    userId: string;
    city: string;
    limit?: number | undefined;
  }): Promise<RecommendationResult | null> {
    if (!env.YUNI_AI_URL) return null;

    try {
      const url = new URL(`${env.YUNI_AI_URL}/recommendations`);
      url.searchParams.set('userId', params.userId);
      url.searchParams.set('city', params.city);
      url.searchParams.set('limit', String(params.limit ?? 5));

      const res = await fetch(url.toString(), {
        headers: {
          'X-Service': 'ai-service',
          'X-Yunicity-App': '1',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) return null;

      const data = (await res.json()) as RecommendationResult;
      return { ...data, source: 'yuni_ai' };
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : String(err);
      console.warn(
        `[AI] Yuni AI indisponible (${errMsg}) → fallback geographique`,
      );
      return null;
    }
  }

  /**
   * Fallback geographique — interroge user-service et community-service
   * pour retourner les acteurs/tribus populaires d'une ville.
   */
  static async getGeographicFallback(
    city: string,
  ): Promise<RecommendationResult> {
    const [actorsRes, tribesRes] = await Promise.allSettled([
      fetch(
        `${env.USER_SERVICE_URL}/users?profileType=commercial&city=${city}&limit=5`,
        {
          headers: { 'x-internal-service': 'ai-service' },
          signal: AbortSignal.timeout(3000),
        },
      ),
      fetch(
        `${env.COMMUNITY_SERVICE_URL}/tribes?city=${city}&limit=5`,
        {
          headers: { 'x-internal-service': 'ai-service' },
          signal: AbortSignal.timeout(3000),
        },
      ),
    ]);

    const actors: Recommendation[] = [];
    const tribes: Recommendation[] = [];

    if (actorsRes.status === 'fulfilled' && actorsRes.value.ok) {
      const data = (await actorsRes.value.json()) as {
        items?: Array<{
          id: string;
          profileType: string;
          profileData?: { businessName?: string };
        }>;
      };
      for (const a of data.items ?? []) {
        actors.push({
          id: a.id,
          type: 'actor',
          name: a.profileData?.businessName ?? a.id,
          reason: `Acteur local populaire a ${city}`,
          score: 0.7,
          city,
        });
      }
    }

    if (tribesRes.status === 'fulfilled' && tribesRes.value.ok) {
      const data = (await tribesRes.value.json()) as {
        items?: Array<{
          id: string;
          name: string;
          membersCount: number;
        }>;
      };
      for (const t of data.items ?? []) {
        tribes.push({
          id: t.id,
          type: 'tribe',
          name: t.name,
          reason: `${t.membersCount} membres actifs`,
          score: 0.65,
          city,
        });
      }
    }

    return {
      actors,
      tribes,
      reason: `Les acteurs populaires de ${city}`,
      source: 'geographic_fallback',
    };
  }
}
