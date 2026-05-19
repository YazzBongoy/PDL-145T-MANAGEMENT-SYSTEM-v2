import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Resources PERSONNE (Workers) based on H/J matrix
  const personResources = [
    { Name: 'Chef équipe', Type: 'PERSONNE', Quantity: 5, Description: 'Chef d\'équipe de chantier' },
    { Name: 'Terrassier', Type: 'PERSONNE', Quantity: 10, Description: 'Ouvrier terrassier' },
    { Name: 'Manœuvre', Type: 'PERSONNE', Quantity: 15, Description: 'Ouvrier manœuvre' },
    { Name: 'Maçon', Type: 'PERSONNE', Quantity: 12, Description: 'Maçon général' },
    { Name: 'Aide maçon', Type: 'PERSONNE', Quantity: 10, Description: 'Aide maçon' },
    { Name: 'Coffreur', Type: 'PERSONNE', Quantity: 8, Description: 'Ouvrier coffreur' },
    { Name: 'Ferrailleur', Type: 'PERSONNE', Quantity: 8, Description: 'Ouvrier ferrailleur' },
    { Name: 'Charpentier', Type: 'PERSONNE', Quantity: 6, Description: 'Charpentier bois' },
    { Name: 'Couvreur', Type: 'PERSONNE', Quantity: 6, Description: 'Couvreur tôles' },
    { Name: 'Soudeur', Type: 'PERSONNE', Quantity: 4, Description: 'Soudeur métallique' },
    { Name: 'Maçon finisseur', Type: 'PERSONNE', Quantity: 5, Description: 'Maçon spécialiste finitions' },
    { Name: 'Peintre', Type: 'PERSONNE', Quantity: 4, Description: 'Peintre bâtiment' },
  ];

  // Resources EQUIPEMENT (Equipment) based on H/J matrix
  const equipmentResources = [
    { Name: 'Pelle', Type: 'EQUIPEMENT', Quantity: 10, Description: 'Pelle manuelle' },
    { Name: 'Pioche', Type: 'EQUIPEMENT', Quantity: 10, Description: 'Pioche manuelle' },
    { Name: 'Brouette', Type: 'EQUIPEMENT', Quantity: 15, Description: 'Brouette pour transport' },
    { Name: 'Bétonnière', Type: 'EQUIPEMENT', Quantity: 3, Description: 'Bétonnière électrique' },
    { Name: 'Vibrateur', Type: 'EQUIPEMENT', Quantity: 2, Description: 'Vibrateur à béton' },
    { Name: 'Truelle', Type: 'EQUIPEMENT', Quantity: 20, Description: 'Truelle maçon' },
    { Name: 'Niveau', Type: 'EQUIPEMENT', Quantity: 5, Description: 'Niveau à bulle' },
    { Name: 'Dame', Type: 'EQUIPEMENT', Quantity: 3, Description: 'Dame de compactage' },
    { Name: 'Arrosoir', Type: 'EQUIPEMENT', Quantity: 5, Description: 'Arrosoir pour béton' },
    { Name: 'Cutter', Type: 'EQUIPEMENT', Quantity: 10, Description: 'Cutter pour film polyane' },
    { Name: 'Scie', Type: 'EQUIPEMENT', Quantity: 5, Description: 'Scie à bois' },
    { Name: 'Marteau', Type: 'EQUIPEMENT', Quantity: 10, Description: 'Marteau' },
    { Name: 'Échelle', Type: 'EQUIPEMENT', Quantity: 4, Description: 'Échelle télescopique' },
    { Name: 'Poste à souder', Type: 'EQUIPEMENT', Quantity: 2, Description: 'Poste à souder portable' },
    { Name: 'Meuleuse', Type: 'EQUIPEMENT', Quantity: 3, Description: 'Meuleuse d\'angle' },
    { Name: 'Taloche', Type: 'EQUIPEMENT', Quantity: 10, Description: 'Taloche pour enduit' },
    { Name: 'Rouleau', Type: 'EQUIPEMENT', Quantity: 8, Description: 'Rouleau à peinture' },
    { Name: 'Coffrage', Type: 'EQUIPEMENT', Quantity: 20, Description: 'Coffrage modulaire' },
  ];

  console.log('Creating PERSONNE resources...');
  await prisma.resource.createMany({
    data: personResources,
    skipDuplicates: true,
  });
  console.log(`  ✓ ${personResources.length} PERSONNE resources created`);

  console.log('\nCreating EQUIPEMENT resources...');
  await prisma.resource.createMany({
    data: equipmentResources,
    skipDuplicates: true,
  });
  console.log(`  ✓ ${equipmentResources.length} EQUIPEMENT resources created`);

  console.log('\n✅ All resources created successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
