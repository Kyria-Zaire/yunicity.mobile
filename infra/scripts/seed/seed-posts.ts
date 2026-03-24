import { prisma } from '@yunicity/database';

export async function seedPosts(
  userIds: Map<string, string>,
  tribeIds: Map<string, string>,
): Promise<void> {
  const existing = await prisma.post.count({
    where: { city: 'reims' },
  });
  if (existing > 0) {
    console.log(`  >> Posts (${existing} deja existants)`);
    return;
  }

  const allUserIds = [...userIds.values()];
  const cyclistes = tribeIds.get('cyclistes-de-reims') ?? null;
  const jazz = tribeIds.get('jazz-au-parvis') ?? null;
  const entrepreneurs = tribeIds.get('entrepreneurs-reims') ?? null;

  const posts = [
    // Mur public Reims
    { content: "Bonjour a tous ! Quelle belle journee pour explorer Reims. Quelqu'un connait un bon cafe pour travailler en centre-ville ?", type: 'text', tribeId: null },
    { content: 'Le marche du Boulingrin est incroyable ce matin. Des producteurs locaux de qualite, je recommande fortement !', type: 'text', tribeId: null },
    { content: "Attention travaux rue de Vesle jusqu'a fin avril. Preferez les rues paralleles.", type: 'announcement', tribeId: null },
    { content: "Quelqu'un a des bons plans pour la fete de la musique a Reims cette annee ?", type: 'question', tribeId: null },
    { content: "La cathedrale de Reims est illuminee ce soir jusqu'a 23h, allez-y c'est magnifique !", type: 'text', tribeId: null },
    { content: "Nouveau restaurant bio ouvert rue de Mars, prix corrects et carte top. A tester !", type: 'text', tribeId: null },
    { content: "Vide grenier dimanche prochain quartier Clairmarais, stand a 2 euros", type: 'event', tribeId: null },

    // Tribu Cyclistes
    { content: "Sortie dominicale confirmee ! RDV dimanche 9h Place d'Erlon. Circuit 35km vers Montagne de Reims", type: 'event', tribeId: cyclistes },
    { content: 'Super balade hier soir sur la coulee verte ! Merci a tous les participants', type: 'text', tribeId: cyclistes },
    { content: "Quelqu'un connait un bon reparateur velo dans le centre ? Mon derailleur fait des siennes...", type: 'question', tribeId: cyclistes },

    // Tribu Jazz
    { content: 'Concert improvise ce vendredi au Parvis ! 20h30, entree libre. On compte sur vous', type: 'event', tribeId: jazz },
    { content: "Magnifique session hier soir, l'ambiance etait au rendez-vous. Merci a tous !", type: 'text', tribeId: jazz },
    { content: 'On cherche un bassiste pour completer notre quartet. Debutants bienvenus !', type: 'question', tribeId: jazz },

    // Tribu Entrepreneurs
    { content: 'Afterwork networking ce jeudi 19h au Bar du Sport. Venez pitcher votre projet en 2 minutes !', type: 'event', tribeId: entrepreneurs },
    { content: "Retour d'experience : j'ai lance mon e-commerce il y a 6 mois. Pret a partager avec qui veut.", type: 'text', tribeId: entrepreneurs },
  ];

  for (const p of posts) {
    const authorId =
      allUserIds[Math.floor(Math.random() * allUserIds.length)] ??
      allUserIds[0];
    await prisma.post.create({
      data: {
        authorId: authorId!,
        tribeId: p.tribeId,
        city: 'reims',
        type: p.type as 'text' | 'event' | 'offer' | 'question' | 'announcement',
        content: p.content,
        mediaKeys: [],
        commentsCount: Math.floor(Math.random() * 8),
        isModerated: true,
        isFlagged: false,
        isPinned: false,
        isActive: true,
      },
    });
  }

  console.log(`  + ${posts.length} posts crees`);
}
