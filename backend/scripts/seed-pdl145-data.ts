import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PDL 145 Territoires data...');

  // 1. Créer le Programme PDL 145 Territoires
  const program = await prisma.program.create({
    data: {
      Name: 'PDL 145 Territoires',
      Description: 'Programme de Développement Local pour 145 territoires - Construction d\'infrastructures sociales et administratives',
      StartDate: new Date('2024-01-01'),
      EndDate: new Date('2026-12-31'),
      Budget: 50000000000.00, // 50 milliards
      Status: 'ACTIVE'
    }
  });
  console.log(`✅ Programme créé: ${program.Name} (ID: ${program.ProgramID})`);

  // 2. Créer les Projets du programme
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        ProgramID: program.ProgramID,
        Name: 'Construction École Primaire Nyamata',
        StartDate: new Date('2024-03-01'),
        EndDate: new Date('2024-12-31'),
        TotalBudget: 500000000.00
      }
    }),
    prisma.project.create({
      data: {
        ProgramID: program.ProgramID,
        Name: 'Centre de Santé de Mugunga',
        StartDate: new Date('2024-06-01'),
        EndDate: new Date('2025-06-30'),
        TotalBudget: 750000000.00
      }
    }),
    prisma.project.create({
      data: {
        ProgramID: program.ProgramID,
        Name: 'Bâtiment Administratif de Goma',
        StartDate: new Date('2024-01-15'),
        EndDate: new Date('2025-03-15'),
        TotalBudget: 1200000000.00
      }
    }),
    prisma.project.create({
      data: {
        ProgramID: program.ProgramID,
        Name: 'Construction Lycée de Bukavu',
        StartDate: new Date('2024-09-01'),
        EndDate: new Date('2026-08-31'),
        TotalBudget: 2000000000.00
      }
    })
  ]);
  console.log(`✅ ${projects.length} projets créés`);

  // 3. Créer les tâches hiérarchiques pour le projet "Construction École Primaire Nyamata"
  const schoolProject = projects[0];

  // Niveau 1: Tâches principales
  const foundationTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      Name: 'Fondations et Infrastructure',
      Description: 'Préparation du terrain et fondations de l\'école',
      Level: 1,
      CompletionStatus: 'InProgress',
      progressPercentage: 65,
      Duration: 90,
      AssignedTo: 'Équipe A - Génie Civil'
    }
  });

  const constructionTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      Name: 'Construction Bâtiment Principal',
      Description: 'Construction des salles de classe et bâtiments',
      Level: 1,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 180,
      AssignedTo: 'Équipe B - Construction'
    }
  });

  const facilitiesTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      Name: 'Aménagements et Équipements',
      Description: 'Installation électrique, sanitaire et mobilier',
      Level: 1,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 60,
      AssignedTo: 'Équipe C - Installations'
    }
  });

  // Niveau 2: Sous-tâches de "Fondations et Infrastructure"
  const excavationTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: foundationTask.TaskID,
      Name: 'Excavation des Fondations',
      Description: 'Terrassement et excavation des tranchées',
      Level: 2,
      CompletionStatus: 'Completed',
      progressPercentage: 100,
      Duration: 30,
      AssignedTo: 'Équipe A1 - Excavation'
    }
  });

  const concreteTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: foundationTask.TaskID,
      Name: 'Coulage Béton Fondations',
      Description: 'Ferraillage et coulage du béton',
      Level: 2,
      CompletionStatus: 'InProgress',
      progressPercentage: 70,
      Duration: 45,
      AssignedTo: 'Équipe A2 - Béton'
    }
  });

  const drainageTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: foundationTask.TaskID,
      Name: 'Système de Drainage',
      Description: 'Installation canalisations et drainage',
      Level: 2,
      CompletionStatus: 'NotStarted',
      progressPercentage: 10,
      Duration: 15,
      AssignedTo: 'Équipe A3 - Plomberie'
    }
  });

  // Niveau 3: Sous-sous-tâches de "Excavation des Fondations"
  await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: excavationTask.TaskID,
      Name: 'Marquage du Terrain',
      Description: 'Tracé des lignes de fondation',
      Level: 3,
      CompletionStatus: 'Completed',
      progressPercentage: 100,
      Duration: 5,
      AssignedTo: 'Opérateur Géomètre'
    }
  });

  await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: excavationTask.TaskID,
      Name: 'Terrassement Manuel',
      Description: 'Nivellement et préparation superficielle',
      Level: 3,
      CompletionStatus: 'Completed',
      progressPercentage: 100,
      Duration: 10,
      AssignedTo: 'Main d\'œuvre Locale'
    }
  });

  await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: excavationTask.TaskID,
      Name: 'Excavation Mécanique',
      Description: 'Creusage avec pelleteuses',
      Level: 3,
      CompletionStatus: 'Completed',
      progressPercentage: 100,
      Duration: 15,
      AssignedTo: 'Opérateur Engins'
    }
  });

  // Niveau 2: Sous-tâches de "Construction Bâtiment Principal"
  const wallsTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: constructionTask.TaskID,
      Name: 'Élévation des Murs',
      Description: 'Montage murs en briques et blocs',
      Level: 2,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 60,
      AssignedTo: 'Équipe B1 - Maçonnerie'
    }
  });

  const roofTask = await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: constructionTask.TaskID,
      Name: 'Charpente et Toiture',
      Description: 'Installation charpente métallique et couverture',
      Level: 2,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 45,
      AssignedTo: 'Équipe B2 - Charpente'
    }
  });

  // Niveau 3: Sous-sous-tâches de "Élévation des Murs"
  await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: wallsTask.TaskID,
      Name: 'Approvisionnement Briques',
      Description: 'Livraison et stockage matériaux',
      Level: 3,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 10,
      AssignedTo: 'Responsable Logistique'
    }
  });

  await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: wallsTask.TaskID,
      Name: 'Montage Murs Extérieurs',
      Description: 'Construction murs périphériques',
      Level: 3,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 35,
      AssignedTo: 'Maçons Expérimentés'
    }
  });

  await prisma.task.create({
    data: {
      ProjectID: schoolProject.ProjectID,
      ParentTaskID: wallsTask.TaskID,
      Name: 'Montage Cloisons Intérieures',
      Description: 'Séparation salles et couloirs',
      Level: 3,
      CompletionStatus: 'NotStarted',
      progressPercentage: 0,
      Duration: 15,
      AssignedTo: 'Équipe Cloisons'
    }
  });

  console.log(`✅ Tâches hiérarchiques créées pour le projet école`);

  // 4. Créer des ressources et les attacher aux tâches
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        Type: 'Heavy Machinery',
        Name: 'Pelleteuse CAT 320',
        Description: 'Excavatrice pour terrassement',
        Quantity: 2,
        Cost: 150000000.00,
        Status: 'active',
        Location: 'Site Nyamata'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Materials',
        Name: 'Ciment Portland',
        Description: 'Sacs de ciment 50kg',
        Quantity: 500,
        Cost: 25000000.00,
        Status: 'active',
        Location: 'Dépôt Nyamata'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Materials',
        Name: 'Briques Pleines',
        Description: 'Briques de construction',
        Quantity: 20000,
        Cost: 40000000.00,
        Status: 'active',
        Location: 'Chantier Nyamata'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Tools',
        Name: 'Bétonnière Électrique',
        Description: 'Malaxeur béton 300L',
        Quantity: 3,
        Cost: 5000000.00,
        Status: 'active',
        Location: 'Site Nyamata'
      }
    })
  ]);
  console.log(`✅ ${resources.length} ressources créées`);

  // Attacher ressources aux tâches
  await Promise.all([
    prisma.taskResource.create({
      data: {
        TaskID: excavationTask.TaskID,
        ResourceID: resources[0].ResourceID, // Pelleteuse
        AllocatedQuantity: 2,
        ActualQuantity: 2,
        UsageDate: new Date('2024-03-15')
      }
    }),
    prisma.taskResource.create({
      data: {
        TaskID: concreteTask.TaskID,
        ResourceID: resources[1].ResourceID, // Ciment
        AllocatedQuantity: 200,
        ActualQuantity: 150,
        UsageDate: new Date('2024-04-01')
      }
    }),
    prisma.taskResource.create({
      data: {
        TaskID: concreteTask.TaskID,
        ResourceID: resources[3].ResourceID, // Bétonnière
        AllocatedQuantity: 2,
        ActualQuantity: 2,
        UsageDate: new Date('2024-04-01')
      }
    })
  ]);
  console.log(`✅ Ressources attachées aux tâches`);

  // 5. Créer quelques tâches pour les autres projets
  // Centre de Santé Mugunga
  const healthProject = projects[1];
  await prisma.task.create({
    data: {
      ProjectID: healthProject.ProjectID,
      Name: 'Préparation Site Mugunga',
      Description: 'Défrichage et nivellement',
      Level: 1,
      CompletionStatus: 'InProgress',
      progressPercentage: 40,
      Duration: 30,
      AssignedTo: 'Équipe Préparation'
    }
  });

  // Bâtiment Administratif Goma
  const adminProject = projects[2];
  const adminTask = await prisma.task.create({
    data: {
      ProjectID: adminProject.ProjectID,
      Name: 'Fondations Bâtiment Admin',
      Description: 'Fondations profondes pour bâtiment 3 étages',
      Level: 1,
      CompletionStatus: 'Completed',
      progressPercentage: 100,
      Duration: 60,
      AssignedTo: 'Équipe Fondations Pro'
    }
  });

  // Sous-tâche niveau 2 pour admin
  await prisma.task.create({
    data: {
      ProjectID: adminProject.ProjectID,
      ParentTaskID: adminTask.TaskID,
      Name: 'Pieux de Fondation',
      Description: 'Forage et coulage pieux béton',
      Level: 2,
      CompletionStatus: 'Completed',
      progressPercentage: 100,
      Duration: 35,
      AssignedTo: 'Spécialiste Pieux'
    }
  });

  console.log(`✅ Tâches créées pour les autres projets`);

  console.log('\n🎉 Données de test PDL 145 Territoires créées avec succès !');
  console.log(`\n📊 Résumé:`);
  console.log(`   • Programme: ${program.Name}`);
  console.log(`   • Projets: ${projects.length}`);
  console.log(`   • Budget total: ${(program.Budget || 0).toLocaleString()} CDF`);
  console.log(`   • Ressources: ${resources.length}`);
  console.log(`\n🚀 L\'application est prête avec des données réalistes !`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
