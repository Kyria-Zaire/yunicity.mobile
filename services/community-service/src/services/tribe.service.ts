import { TribeRepository } from '../repositories/tribe.repository.js';
import type { TribeCategory } from '../models/Tribe.model.js';

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; statusCode: number };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

export class TribeService {
  static async create(payload: {
    name: string;
    description: string;
    category: TribeCategory;
    city: string;
    creatorId: string;
    isPublic?: boolean | undefined;
    tags?: string[] | undefined;
  }): Promise<ServiceResult<{ id: string; name: string; membersCount: number }>> {
    const slug = generateSlug(payload.name);
    const existing = await TribeRepository.findBySlugAndCity(
      slug,
      payload.city,
    );
    if (existing) {
      return {
        ok: false,
        code: 'TRIBE_EXISTS',
        message: 'Une tribu avec ce nom existe déjà dans cette ville',
        statusCode: 409,
      };
    }

    const tribe = await TribeRepository.create({
      ...payload,
      slug,
      isPublic: payload.isPublic ?? true,
      tags: payload.tags ?? [],
      members: [payload.creatorId],
      membersCount: 1,
    });

    return { ok: true, data: tribe };
  }

  static async join(
    tribeId: string,
    userId: string,
  ): Promise<ServiceResult<{ membersCount: number }>> {
    const tribe = await TribeRepository.findById(tribeId);
    if (!tribe) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Tribu introuvable',
        statusCode: 404,
      };
    }
    if (tribe.members.some((m) => m.userId === userId)) {
      return {
        ok: false,
        code: 'ALREADY_MEMBER',
        message: 'Vous êtes déjà membre de cette tribu',
        statusCode: 409,
      };
    }
    const updated = await TribeRepository.addMember(tribeId, userId);
    return { ok: true, data: { membersCount: updated.membersCount } };
  }

  static async leave(
    tribeId: string,
    userId: string,
  ): Promise<ServiceResult<{ membersCount: number }>> {
    const tribe = await TribeRepository.findById(tribeId);
    if (!tribe) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Tribu introuvable',
        statusCode: 404,
      };
    }
    if (!tribe.members.some((m) => m.userId === userId)) {
      return {
        ok: false,
        code: 'NOT_MEMBER',
        message: "Vous n'êtes pas membre de cette tribu",
        statusCode: 400,
      };
    }
    if (tribe.creatorId === userId) {
      return {
        ok: false,
        code: 'CREATOR_CANNOT_LEAVE',
        message: 'Le créateur ne peut pas quitter la tribu',
        statusCode: 400,
      };
    }
    const updated = await TribeRepository.removeMember(tribeId, userId);
    return { ok: true, data: { membersCount: updated.membersCount } };
  }

  static async listByCity(params: {
    city: string;
    category?: TribeCategory | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
  }) {
    return TribeRepository.findPaginated({
      filter: {
        city: params.city,
        isActive: true,
        ...(params.category ? { category: params.category } : {}),
      },
      cursor: params.cursor,
      limit: params.limit ?? 20,
    });
  }
}
