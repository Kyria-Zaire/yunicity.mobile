import { randomUUID } from 'crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { uploadToR2 } from '../providers/r2.provider.js';
import { scanBuffer } from '../providers/clamav.provider.js';
import { verifySIRET } from '../providers/sirene.provider.js';
import { kycQueue } from '../jobs/queues.js';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export type KycDocType =
  | 'kbis'
  | 'rna'
  | 'siret'
  | 'urssaf'
  | 'uai'
  | 'other';

type UploadResult =
  | { ok: true; r2Key: string }
  | { ok: false; code: string; message: string };

type SiretResult =
  | {
      ok: true;
      autoVerified: boolean;
      businessName?: string | undefined;
    }
  | { ok: false; code: string; message: string };

export class KycService {
  static async uploadDocument(params: {
    userId: string;
    docType: KycDocType;
    buffer: Buffer;
    mimeType: string;
  }): Promise<UploadResult> {
    // 1. Valider MIME côté serveur (pas seulement l'extension)
    if (!ALLOWED_MIME.has(params.mimeType)) {
      return {
        ok: false,
        code: 'INVALID_FILE_TYPE',
        message: 'Type non autorisé (PDF, JPEG, PNG, WEBP)',
      };
    }

    // 2. Valider la taille
    if (params.buffer.length > MAX_SIZE) {
      return {
        ok: false,
        code: 'FILE_TOO_LARGE',
        message: 'Fichier trop volumineux (max 10 MB)',
      };
    }

    // 3. Scan ClamAV AVANT stockage — pipeline bloquant
    const scan = await scanBuffer(params.buffer);
    if (!scan.clean) {
      console.warn(
        `Fichier infecté user=${params.userId} virus=${scan.virusName}`,
      );
      return {
        ok: false,
        code: 'FILE_INFECTED',
        message: 'Fichier refusé — contenu suspect',
      };
    }

    // 4. Clé R2 structurée — bucket privé
    const ext = params.mimeType === 'application/pdf' ? 'pdf' : 'jpg';
    const r2Key = `kyc/${params.userId}/${params.docType}/${randomUUID()}.${ext}`;

    await uploadToR2({
      key: r2Key,
      body: params.buffer,
      contentType: params.mimeType,
    });

    // 5. Enregistrer dans MongoDB
    await UserRepository.addKycDocument(params.userId, {
      type: params.docType,
      r2Key,
      uploadedAt: new Date(),
    });

    // 6. Passer en under_review
    await UserRepository.updateVerificationStatus(
      params.userId,
      'under_review',
    );

    // 7. Job de review async
    await kycQueue.add('review-kyc', {
      userId: params.userId,
      docType: params.docType,
      r2Key,
    });

    return { ok: true, r2Key };
  }

  static async verifySiretAuto(params: {
    userId: string;
    siret: string;
  }): Promise<SiretResult> {
    const result = await verifySIRET(params.siret);

    if (!result.valid) {
      return {
        ok: false,
        code: 'INVALID_SIRET',
        message: 'SIRET invalide ou introuvable',
      };
    }
    if (!result.active) {
      return {
        ok: false,
        code: 'INACTIVE_SIRET',
        message: 'Établissement inactif',
      };
    }

    // Vérification automatique réussie → verified
    await UserRepository.updateVerificationStatus(params.userId, 'verified', {
      verifiedAt: new Date(),
      autoVerified: true,
    });

    await UserRepository.updateProfileData(params.userId, {
      siret: params.siret,
      businessName: result.businessName,
      address: result.address,
    });

    return {
      ok: true,
      autoVerified: true,
      businessName: result.businessName,
    };
  }
}
