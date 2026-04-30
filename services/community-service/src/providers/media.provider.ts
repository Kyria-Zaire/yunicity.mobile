import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { uploadToR2, getSignedDownloadUrl } from './r2.provider.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_WIDTH = 1080;
const THUMB_WIDTH = 320;
const IMAGE_QUALITY = 85;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export type MediaVariant = {
  original: string; // r2Key
  thumb: string; // r2Key
  width: number;
  height: number;
  size: number;
  mimeType: string;
};

export async function processAndUploadImage(
  buffer: Buffer,
  mimeType: string,
  postId: string,
): Promise<MediaVariant> {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`Type non autorisé: ${mimeType}`);
  }
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error('Image trop volumineuse (max 10MB)');
  }

  const input = sharp(buffer, { failOn: 'none' });
  const metadata = await input.metadata();

  const mainBuffer = await sharp(buffer, { failOn: 'none' })
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer();

  const thumbBuffer = await sharp(buffer, { failOn: 'none' })
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  const assetId = randomUUID();
  const mainKey = `media/posts/${postId}/${assetId}/1080.webp`;
  const thumbKey = `media/posts/${postId}/${assetId}/thumb.webp`;

  await Promise.all([
    uploadToR2({ key: mainKey, body: mainBuffer, contentType: 'image/webp' }),
    uploadToR2({ key: thumbKey, body: thumbBuffer, contentType: 'image/webp' }),
  ]);

  const width = Math.min(metadata.width ?? MAX_IMAGE_WIDTH, MAX_IMAGE_WIDTH);
  const height = metadata.height ?? 0;

  return {
    original: mainKey,
    thumb: thumbKey,
    width,
    height,
    size: mainBuffer.length,
    mimeType: 'image/webp',
  };
}

export async function validateAndUploadVideo(
  buffer: Buffer,
  mimeType: string,
  postId: string,
): Promise<{ key: string; size: number; mimeType: string }> {
  if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    throw new Error(`Type vidéo non autorisé: ${mimeType}`);
  }
  if (buffer.length > MAX_VIDEO_SIZE) {
    throw new Error('Vidéo trop volumineuse (max 100MB)');
  }

  const assetId = randomUUID();
  const ext = mimeType === 'video/webm' ? 'webm' : 'mp4';
  const key = `media/posts/${postId}/${assetId}/video.${ext}`;

  await uploadToR2({ key, body: buffer, contentType: mimeType });

  return { key, size: buffer.length, mimeType };
}

export async function getMediaUrls(variant: MediaVariant): Promise<{
  url: string;
  thumbUrl: string;
}> {
  const [url, thumbUrl] = await Promise.all([
    getSignedDownloadUrl(variant.original),
    getSignedDownloadUrl(variant.thumb),
  ]);
  return { url, thumbUrl };
}

