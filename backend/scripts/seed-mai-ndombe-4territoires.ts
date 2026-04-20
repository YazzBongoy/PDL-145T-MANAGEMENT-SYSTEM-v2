import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PDL 145 T - 4 Territoires du Maï-Ndombe
const TERRITORIES = [
  { name: 'Territoire de Mushie', sites: 8 },
  { name: 'Territoire d\'Inongo', sites: 12 },
  { name: 'Territoire d\'Yumbi', sites: 6 },
  { name: 'Territoire de Kutu', sites: 8 }
];

// Sites par territoire
const SITES_MUSHIE = [
  { name: 'École Primaire Mushie Centre', type: 'school', localite: 'Mushie', budget: 450000000 },
  { name: 'École Secondaire Technique Mushie', type: 'school', localite: 'Mushie', budget: 850000000 },
  { name: 'Centre de Santé de Référence Mushie', type: 'health', localite: 'Mushie', budget: 650000000 },
  { name: 'École Primaire Moke', type: 'school', localite: 'Moke', budget: 380000000 },
  { name: 'Centre de Santé Moke', type: 'health', localite: 'Moke', budget: 520000000 },
  { name: 'École Primaire Maboki', type: 'school', localite: 'Maboki', budget: 360000000 },
  { name: 'Centre de Santé Maboki', type: 'health', localite: 'Maboki', budget: 480000000 },
  { name: 'Bâtiment Administratif Territorial Mushie', type: 'admin', localite: 'Mushie', budget: 1200000000 }
];

const SITES_INONGO = [
  { name: 'École Primaire Inongo Centre', type: 'school', localite: 'Inongo', budget: 500000000 },
  { name: 'École Secondaire Inongo 1', type: 'school', localite: 'Inongo', budget: 750000000 },
  { name: 'École Secondaire Technique Inongo', type: 'school', localite: 'Inongo', budget: 900000000 },
  { name: 'Hôpital Général de Référence Inongo', type: 'health', localite: 'Inongo', budget: 1500000000 },
  { name: 'Centre de Santé Kole-Kole', type: 'health', localite: 'Kole-Kole', budget: 450000000 },
  { name: 'Centre de Santé Ebonda', type: 'health', localite: 'Ebonda', budget: 480000000 },
  { name: 'Bâtiment Administratif Territorial Inongo', type: 'admin', localite: 'Inongo', budget: 1800000000 },
  { name: 'École Primaire Kanda-Kanda', type: 'school', localite: 'Kanda-Kanda', budget: 400000000 },
  { name: 'Centre de Santé Kanda-Kanda', type: 'health', localite: 'Kanda-Kanda', budget: 520000000 },
  { name: 'École Primaire Kole-Kole', type: 'school', localite: 'Kole-Kole', budget: 380000000 },
  { name: 'Centre de Santé Isongo', type: 'health', localite: 'Isongo', budget: 500000000 },
  { name: 'École Primaire Isongo', type: 'school', localite: 'Isongo', budget: 420000000 }
];

const SITES_YUMBI = [
  { name: 'École Primaire Yumbi Centre', type: 'school', localite: 'Yumbi', budget: 480000000 },
  { name: 'Centre de Santé de Référence Yumbi', type: 'health', localite: 'Yumbi', budget: 720000000 },
  { name: 'École Primaire Ngiri-Ngiri', type: 'school', localite: 'Ngiri-Ngiri', budget: 380000000 },
  { name: 'Centre de Santé Ngiri-Ngiri', type: 'health', localite: 'Ngiri-Ngiri', budget: 520000000 },
  { name: 'Bâtiment Administratif Territorial Yumbi', type: 'admin', localite: 'Yumbi', budget: 950000000 },
  { name: 'École Primaire Yamba-Yamba', type: 'school', localite: 'Yamba-Yamba', budget: 350000000 }
];

const SITES_KUTU = [
  { name: 'École Primaire Kutu Centre', type: 'school', localite: 'Kutu', budget: 420000000 },
  { name: 'École Secondaire Kutu', type: 'school', localite: 'Kutu', budget: 680000000 },
  { name: 'Centre de Santé de Référence Kutu', type: 'health', localite: 'Kutu', budget: 580000000 },
  { name: 'École Primaire Bokungu', type: 'school', localite: 'Bokungu', budget: 360000000 },
  { name: 'Centre de Santé Bokungu', type: 'health', localite: 'Bokungu', budget: 480000000 },
  { name: 'École Primaire Ifumi', type: 'school', localite: 'Ifumi', budget: 340000000 },
  { name: 'Centre de Santé Ifumi', type: 'health', localite: 'Ifumi', budget: 460000000 },
  { name: 'Bâtiment Administratif Territorial Kutu', type: 'admin', localite: 'Kutu', budget: 1100000000 }
];

async function main() {
  console.log('🌱 Seeding PDL 145 T - Maï-Ndombe (4 Territoires)...');
  console.log('   Territoires: Mushie, Inongo, Yumbi, Kutu');
  console.log('   Total sites: 34\n');

  // 1. Créer le Programme PDL 145 T Maï-Ndombe
  const program = await prisma.program.create({
    data: {
      Name: 'PDL 145 T - Maï-Ndombe',
      Description: 'Programme de Développement Local des 145 Territoires - Province du Maï-Ndombe. Couvre 4 territoires: Mushie, Inongo, Yumbi et Kutu avec 34 sites d\'infrastructures sociales (écoles, centres de santé et bâtiments administratifs).',
      StartDate: new Date('2019-07-01'),  // Lancement officiel
      EndDate: new Date('2026-12-31'),    // Extension prévue
      Budget: 15700000000.00,              // 15.7 milliards CDF
      Status: 'ACTIVE'
    }
  });
  console.log(`✅ Programme créé: ${program.Name} (ID: ${program.ProgramID})`);
  console.log(`   Budget: ${(program.Budget || 0).toLocaleString()} CDF`);

  // 2. Créer les projets pour chaque territoire
  const allSites = [
    ...SITES_MUSHIE.map(s => ({ ...s, territory: 'Territoire de Mushie' })),
    ...SITES_INONGO.map(s => ({ ...s, territory: 'Territoire d\'Inongo' })),
    ...SITES_YUMBI.map(s => ({ ...s, territory: 'Territoire d\'Yumbi' })),
    ...SITES_KUTU.map(s => ({ ...s, territory: 'Territoire de Kutu' }))
  ];

  const createdProjects = [];
  
  for (const site of allSites) {
    const project = await prisma.project.create({
      data: {
        ProgramID: program.ProgramID,
        Name: site.name,
        StartDate: new Date('2020-01-15'),
        EndDate: new Date('2025-12-31'),
        TotalBudget: site.budget,
        // Ajouter des métadonnées dans la description
        Description: `Projet du ${site.territory} - Localité: ${site.localite} - Type: ${site.type === 'school' ? 'Éducation' : site.type === 'health' ? 'Santé' : 'Administration'}`
      }
    });
    createdProjects.push({ ...project, site });
  }

  console.log(`✅ ${createdProjects.length} projets créés:\n`);
  
  // Afficher la répartition
  const schools = createdProjects.filter(p => p.site.type === 'school');
  const health = createdProjects.filter(p => p.site.type === 'health');
  const admin = createdProjects.filter(p => p.site.type === 'admin');
  
  console.log(`   📚 Écoles: ${schools.length}`);
  console.log(`   🏥 Centres de Santé: ${health.length}`);
  console.log(`   🏢 Bâtiments Administratifs: ${admin.length}\n`);

  // 3. Créer des tâches hiérarchiques pour quelques projets principaux
  console.log('📝 Création des tâches hiérarchiques...');
  
  // Projets principaux (hôpitaux et grandes écoles)
  const mainProjects = createdProjects.filter(p => 
    p.Name.includes('Hôpital') || 
    p.Name.includes('Secondaire Technique') ||
    p.Name.includes('Bâtiment Administratif Territorial')
  ).slice(0, 4); // 4 projets principaux

  const createdTasks: Array<{ taskID: number; projectID: number }> = [];

  for (const project of mainProjects) {
    console.log(`   Creating tasks for: ${project.Name}`);
    
    // Niveau 1: Tâches principales
    const task1 = await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        Name: 'Préparation du site et fondations',
        Description: 'Terrassement, nivellement et fondations',
        Level: 1,
        CompletionStatus: 'InProgress',
        progressPercentage: 75,
        Duration: 90,
        AssignedTo: 'Équipe Génie Civil'
      }
    });
    createdTasks.push({ taskID: task1.TaskID, projectID: project.ProjectID });

    // Niveau 2: Sous-tâches
    const task2 = await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        ParentTaskID: task1.TaskID,
        Name: 'Terrassement et nivellement',
        Description: 'Préparation du terrain',
        Level: 2,
        CompletionStatus: 'Completed',
        progressPercentage: 100,
        Duration: 30,
        AssignedTo: 'Équipe Terrassement'
      }
    });

    const task3 = await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        ParentTaskID: task1.TaskID,
        Name: 'Fondations profondes',
        Description: 'Coulage des fondations',
        Level: 2,
        CompletionStatus: 'InProgress',
        progressPercentage: 70,
        Duration: 60,
        AssignedTo: 'Équipe Béton'
      }
    });

    // Niveau 3: Sous-sous-tâches
    await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        ParentTaskID: task2.TaskID,
        Name: 'Défrichage',
        Description: 'Défrichage du terrain',
        Level: 3,
        CompletionStatus: 'Completed',
        progressPercentage: 100,
        Duration: 10,
        AssignedTo: 'Main d\'œuvre locale'
      }
    });

    await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        ParentTaskID: task2.TaskID,
        Name: 'Nivellement mécanique',
        Description: 'Nivellement avec engins',
        Level: 3,
        CompletionStatus: 'Completed',
        progressPercentage: 100,
        Duration: 20,
        AssignedTo: 'Opérateur engins'
      }
    });

    // Autre branche Niveau 1
    const task4 = await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        Name: 'Construction bâtiment principal',
        Description: 'Élévation des murs et toiture',
        Level: 1,
        CompletionStatus: 'NotStarted',
        progressPercentage: 15,
        Duration: 180,
        AssignedTo: 'Équipe Construction'
      }
    });

    // Niveau 2
    await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        ParentTaskID: task4.TaskID,
        Name: 'Élévation des murs',
        Description: 'Maçonnerie et blocs',
        Level: 2,
        CompletionStatus: 'NotStarted',
        progressPercentage: 5,
        Duration: 90,
        AssignedTo: 'Maçons'
      }
    });

    await prisma.task.create({
      data: {
        ProjectID: project.ProjectID,
        ParentTaskID: task4.TaskID,
        Name: 'Charpente métallique',
        Description: 'Installation charpente',
        Level: 2,
        CompletionStatus: 'NotStarted',
        progressPercentage: 0,
        Duration: 60,
        AssignedTo: 'Charpentiers'
      }
    });
  }

  console.log(`✅ Tâches hiérarchiques créées\n`);

  // 4. Créer des ressources
  console.log('🔧 Création des ressources...');
  
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        Type: 'Heavy Machinery',
        Name: 'Pelleteuse CAT 320D',
        Description: 'Excavatrise 20 tonnes pour terrassement',
        Quantity: 3,
        Cost: 450000000,
        Status: 'active',
        Location: 'Maï-Ndombe - Inongo'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Materials',
        Name: 'Ciment Portland 42.5',
        Description: 'Sacs de ciment 50kg pour construction',
        Quantity: 2500,
        Cost: 125000000,
        Status: 'active',
        Location: 'Dépôt Inongo'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Materials',
        Name: 'Blocs de construction',
        Description: 'Blocs en béton 15x20x40cm',
        Quantity: 80000,
        Cost: 240000000,
        Status: 'active',
        Location: 'Chantiers Maï-Ndombe'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Heavy Machinery',
        Name: 'Bétonnière électrique 350L',
        Description: 'Malaxeur pour préparation béton',
        Quantity: 8,
        Cost: 32000000,
        Status: 'active',
        Location: 'Sites de construction'
      }
    }),
    prisma.resource.create({
      data: {
        Type: 'Tools',
        Name: 'Scaffolding métallique',
        Description: 'Échafaudages de chantier',
        Quantity: 25,
        Cost: 75000000,
        Status: 'active',
        Location: 'Entrepôt provincial'
      }
    })
  ]);

  console.log(`✅ ${resources.length} ressources créées\n`);

  // 5. Attacher ressources aux tâches créées
  console.log('🔗 Attachement des ressources aux tâches...');
  
  // Attacher aux 2 premières tâches de niveau 1
  for (let i = 0; i < Math.min(2, createdTasks.length); i++) {
    await prisma.taskResource.create({
      data: {
        TaskID: createdTasks[i].taskID,
        ResourceID: resources[0].ResourceID, // Pelleteuse
        AllocatedQuantity: 2,
        ActualQuantity: 2,
        UsageDate: new Date('2024-03-01')
      }
    });

    await prisma.taskResource.create({
      data: {
        TaskID: createdTasks[i].taskID,
        ResourceID: resources[1].ResourceID, // Ciment
        AllocatedQuantity: 800,
        ActualQuantity: 650,
        UsageDate: new Date('2024-04-01')
      }
    });
  }

  console.log(`✅ Ressources attachées aux tâches\n`);

  // Résumé final
  console.log('========================================');
  console.log('    🎉 SEEDING TERMINÉ AVEC SUCCÈS');
  console.log('========================================\n');
  console.log(`📊 RÉSUMÉ PDL 145 T - Maï-Ndombe:\n`);
  console.log(`   🏛️ Programme: ${program.Name}`);
  console.log(`   💰 Budget total: ${(program.Budget || 0).toLocaleString()} CDF`);
  console.log(`   📍 Territoires: 4 (Mushie, Inongo, Yumbi, Kutu)`);
  console.log(`   🏗️ Projets: ${createdProjects.length} sites`);
  console.log(`      - ${schools.length} Écoles`);
  console.log(`      - ${health.length} Centres de Santé`);
  console.log(`      - ${admin.length} Bâtiments Administratifs`);
  console.log(`   📋 Tâches: Hiérarchie 3 niveaux`);
  console.log(`   🔧 Ressources: ${resources.length} types\n`);
  console.log('========================================');
  console.log('   L\'application est prête !');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
