import { prisma } from '@yunicity/database';

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('PostgreSQL connected (moderation-service)');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
