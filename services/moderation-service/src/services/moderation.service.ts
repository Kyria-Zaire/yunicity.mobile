import { prisma } from '@yunicity/database';
import { env } from '../config/env.js';

type ModerationAction = 'approved' | 'flagged' | 'rejected' | 'pending';

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; statusCode: number };

interface ModerationResult {
  action: ModerationAction;
  score: number;
  flaggedCategories: string[];
  reason?: string | undefined;
}

interface ModeratePayload {
  contentId: string;
  contentType: string;
  authorId: string;
  content: string;
}

const FORBIDDEN_WORDS = [
  'connard',
  'encule',
  'putain',
  'nique',
  'salaud',
  'enfoire',
  'batard',
  'fdp',
  'ntm',
  'pd',
  'tg',
  'nazi',
  'hitler',
  'terroriste',
  'bombe',
  'drogue',
  'cocaine',
  'crack',
  'meth',
];

export class ModerationService {
  static async moderate(
    payload: ModeratePayload,
  ): Promise<Result<ModerationResult>> {
    // Step 1: Forbidden words filter (fast, local)
    const forbiddenResult = ModerationService.checkForbiddenWords(
      payload.content,
    );

    if (forbiddenResult.flagged) {
      const result: ModerationResult = {
        action: 'rejected',
        score: 1.0,
        flaggedCategories: ['forbidden_words'],
        reason: `Mots interdits detectes: ${forbiddenResult.words.join(', ')}`,
      };

      await ModerationService.saveLog(payload, result);
      return { ok: true, data: result };
    }

    // Step 2: OpenAI Moderation API (if key present)
    if (env.OPENAI_API_KEY) {
      const aiResult = await ModerationService.callOpenAIModeration(
        payload.content,
      );
      if (aiResult) {
        await ModerationService.saveLog(payload, aiResult);
        return { ok: true, data: aiResult };
      }
    }

    // Step 3: Stub — approve by default in dev
    const result: ModerationResult = {
      action: 'approved',
      score: 0,
      flaggedCategories: [],
    };

    await ModerationService.saveLog(payload, result);
    return { ok: true, data: result };
  }

  static checkForbiddenWords(content: string): {
    flagged: boolean;
    words: string[];
  } {
    const lower = content.toLowerCase();
    const found = FORBIDDEN_WORDS.filter((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lower);
    });
    return { flagged: found.length > 0, words: found };
  }

  private static async callOpenAIModeration(
    content: string,
  ): Promise<ModerationResult | null> {
    try {
      const response = await fetch(
        'https://api.openai.com/v1/moderations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({ input: content }),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) return null;

      const data = (await response.json()) as {
        results: Array<{
          flagged: boolean;
          categories: Record<string, boolean>;
          category_scores: Record<string, number>;
        }>;
      };

      const result = data.results[0];
      if (!result) return null;

      const flaggedCategories = Object.entries(result.categories)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const maxScore = Math.max(
        ...Object.values(result.category_scores),
        0,
      );

      let action: ModerationAction = 'approved';
      if (result.flagged) {
        action = maxScore > 0.8 ? 'rejected' : 'flagged';
      }

      return {
        action,
        score: Math.round(maxScore * 100) / 100,
        flaggedCategories,
        reason: result.flagged
          ? `OpenAI moderation: ${flaggedCategories.join(', ')}`
          : undefined,
      };
    } catch {
      return null;
    }
  }

  private static async saveLog(
    payload: ModeratePayload,
    result: ModerationResult,
  ): Promise<void> {
    await prisma.moderationLog.create({
      data: {
        postId: payload.contentId,
        action: result.action,
        score: result.score,
        reason: result.reason ?? null,
        autoAction: true,
      },
    });
  }

  static async getQueue(filters: {
    action?: string | undefined;
    contentType?: string | undefined;
  } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.action) where['action'] = filters.action;

    return prisma.moderationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  static async reviewItem(
    logId: string,
    action: ModerationAction,
    _reviewerId: string,
  ): Promise<Result<{ logId: string; action: ModerationAction }>> {
    const log = await prisma.moderationLog.findUnique({
      where: { id: logId },
    });
    if (!log) {
      return {
        ok: false,
        code: 'LOG_NOT_FOUND',
        message: 'Log de moderation introuvable',
        statusCode: 404,
      };
    }

    await prisma.moderationLog.update({
      where: { id: logId },
      data: {
        action,
        autoAction: false,
      },
    });

    return { ok: true, data: { logId: log.id, action } };
  }
}
