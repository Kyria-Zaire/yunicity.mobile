import { prisma } from '@yunicity/database';
import { seedUsers } from './seed-users.js';
import { seedTribes } from './seed-tribes.js';
import { seedPosts } from './seed-posts.js';
import { seedPartners } from './seed-partners.js';

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');

  console.log('Seed Yunicity - Reims Beta (PostgreSQL)');
  console.log(
    `   Mode: ${reset ? 'RESET (suppression + recreation)' : 'UPSERT (ajout uniquement)'}\n`,
  );

  await prisma.$connect();
  console.log('PostgreSQL connecte\n');

  if (reset) {
    // Order matters — FK constraints
    await prisma.post.deleteMany({});
    console.log('  x Post supprime');
    await prisma.tribeMember.deleteMany({});
    console.log('  x TribeMember supprime');
    await prisma.tribe.deleteMany({});
    console.log('  x Tribe supprime');
    await prisma.partner.deleteMany({});
    console.log('  x Partner supprime');
    await prisma.kycDocument.deleteMany({});
    console.log('  x KycDocument supprime');
    await prisma.user.deleteMany({});
    console.log('  x User supprime');
    console.log('');
  }

  console.log('Utilisateurs...');
  const userIds = await seedUsers();

  console.log('\nTribus...');
  const tribeIds = await seedTribes(userIds);

  console.log('\nPosts...');
  await seedPosts(userIds, tribeIds);

  console.log('\nPartenaires CRM...');
  await seedPartners(userIds);

  await prisma.$disconnect();

  console.log('\nSeed termine !');
  console.log('---');
  console.log(`   ${userIds.size} utilisateurs`);
  console.log(`   ${tribeIds.size} tribus`);
  console.log('   Mot de passe test : TestYunicity2026!');
  console.log('---');
}

void main().catch((err) => {
  console.error('Seed echoue:', err);
  process.exit(1);
});
