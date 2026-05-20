import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURE PDL-145T (ontologie du programme) :
//
//   Programme PDL-145T — Maï-Ndombe
//     └── Lot/Projet  (1 par territoire = 1 contrat ASCAT SPPE SARL)
//           ├── Territoire d'Inongo  → 15 sites
//           ├── Territoire de Kutu   → 14 sites
//           ├── Territoire de Mushie → 20 sites
//           └── Territoire d'Yumbi   → 16 sites
//                 └── Chaque site → 15 tâches de construction
// ─────────────────────────────────────────────────────────────────────────────

function siteType(name) {
  const n = name.toUpperCase();
  if (n.startsWith('BAT') || n.startsWith('BÂTIMENT')) return 'BATIMENT_ADMINISTRATIF';
  if (n.startsWith('CS') || n.startsWith('HGR') || n.startsWith('HOPITAL')) return 'CENTRE_DE_SANTE';
  return 'ECOLE_PRIMAIRE';
}

function slugify(name) {
  return name.toUpperCase()
    .replace(/[ÀÁÂÃÄÅàáâãäå]/g, 'A').replace(/[ÈÉÊËèéêë]/g, 'E')
    .replace(/[ÌÍÎÏìíîï]/g, 'I').replace(/[ÒÓÔÕÖòóôõö]/g, 'O')
    .replace(/[ÙÚÛÜùúûü]/g, 'U').replace(/[ÇçÑñ]/g, 'C')
    .replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

const SITE_BUDGET = { BATIMENT_ADMINISTRATIF: 1_200_000_000, CENTRE_DE_SANTE: 650_000_000, ECOLE_PRIMAIRE: 480_000_000 };

// ── LOTS / PROJETS PAR TERRITOIRE ────────────────────────────────────────────
// Chaque entrée = 1 Projet (lot de travaux) couvrant N sites d'un territoire
const LOTS = [
  {
    territory:   "Territoire d'Inongo",
    terrCode:    'ING',
    projectName: "Lot Inongo — Construction d'infrastructures sociales",
    startDate:   '2020-03-01',
    endDate:     '2025-06-30',
    sites: [
      "Bâtiment Administratif d'INONGO",
      "EP ISANGA", "EP IYANZA", "EP BONGO NSAMBELO", "EP MPOLE", "EP MPENGE",
      "EP2 SELENGE", "EP MATESO 2", "EP MPUNZO BEKE",
      "CS NSELENGE", "CS MBALA", "CS MPANZA", "CS NKOLO BEKE", "CS BOKOTE", "CS NTANDE MPENGE",
    ],
  },
  {
    territory:   'Territoire de Kutu',
    terrCode:    'KUT',
    projectName: 'Lot Kutu — Construction d\'infrastructures sociales',
    startDate:   '2020-03-01',
    endDate:     '2025-06-30',
    sites: [
      'Bâtiment Administratif de KUTU',
      'EP TOLO1', 'EP INUNU', 'EP LEBAMA', 'EP KESINA', 'EP SEMENDWA',
      'EP KENZUMA', 'EP KEMPILI', 'EP KIBAMBILI',
      'CS TOLO2', 'CS KEMPEKA', 'CS LUMUMBA', 'CS BOKORO', 'CS SEMENDWA',
    ],
  },
  {
    territory:   'Territoire de Mushie',
    terrCode:    'MSH',
    projectName: 'Lot Mushie — Construction d\'infrastructures sociales',
    startDate:   '2020-06-01',
    endDate:     '2025-12-31',
    sites: [
      'Bâtiment Administratif de MUSHIE',
      'EP BOLEBE', 'EP NGATORO', 'EP MBALI', 'EP NSENU', 'EP MPEMBE',
      'EP BOBOTO', 'EP IZONO', 'EP LIBOMA NGUBA', 'EP MWANZA', 'EP NSEMU',
      'CS BOBALA', 'CS IZONO', 'CS NKETALE', 'CS MBAA', 'CS NGELE NGEMO',
      'CS IKILI', 'CS IBAA', 'CS LADI', 'CS LOBOBI',
    ],
  },
  {
    territory:   "Territoire d'Yumbi",
    terrCode:    'YMB',
    projectName: "Lot Yumbi — Construction d'infrastructures sociales",
    startDate:   '2020-06-01',
    endDate:     '2025-12-31',
    sites: [
      'Bâtiment Administratif de YUMBI',
      'EP BOLINGO', 'EP NKOMBE', 'EP BONGENDE', 'EP KEBAKONDE', 'EP MAMBONGO',
      'EP MOBOKO', 'EP MONGALA', 'EP MOVULA', 'EP MUTEZIONO', 'EP NGAPOKO', 'EP SAINT MICHEL',
      'CS BOLU', 'CS MOLENDE', 'CS MONGAMA', 'CS NKOLO YOKA',
    ],
  },
];

// ─── HIÉRARCHIE DES TÂCHES — 3 niveaux (source: TMUPDATED PLANNING) ──────────
//
// Niveau 1 = Rubrique contrat     (Weight = poids TEP contrat %)
// Niveau 2 = Sous-rubrique travaux (Weight = poids TEP travaux %)
// Niveau 3 = Tâche feuille         (Weight = 1, pondération égale)
//
// TEP site = Σ(TEP_rubrique_L1 × poids_L1) / 100
// TEP_rubrique_L1 = Σ(TEP_sousrubrique_L2 × poids_L2) / Σ(poids_L2)
// TEP_sousrubrique_L2 = moyenne simple des tâches feuilles L3
//
// Poids contrat : Gros Œuvres 50% | Second Œuvre 25% | Finition 15% | Fournitures 10%
// ─────────────────────────────────────────────────────────────────────────────

const TASK_HIERARCHY = [
  {
    name: 'TRAVAUX DE GROS ŒUVRES', level: 1, sort: 1, weight: 50,
    children: [
      {
        name: 'TRAVAUX DE FONDATIONS', level: 2, sort: 1, weight: 17,
        children: [
          { name: 'Installation et Repli Chantier',                          level: 3, sort: 1,  weight: 1 },
          { name: 'Fouilles manuelles en section obligatoire',               level: 3, sort: 2,  weight: 1 },
          { name: 'Maçonnerie de Fondation sur béton de propreté',           level: 3, sort: 3,  weight: 1 },
          { name: 'Socles, Dès, Colonnes et chape en B-A',                  level: 3, sort: 4,  weight: 1 },
          { name: 'Remblais des fondations avec terres in situ ou d\'apport',level: 3, sort: 5,  weight: 1 },
          { name: 'Sous-Pavement',                                           level: 3, sort: 6,  weight: 1 },
        ],
      },
      {
        name: "TRAVAUX D'ÉLÉVATIONS", level: 2, sort: 2, weight: 18,
        children: [
          { name: "Murs d'allège et de séparations",                         level: 3, sort: 1,  weight: 1 },
          { name: 'Murs sous linteau',                                       level: 3, sort: 2,  weight: 1 },
          { name: 'Chainage linteaux et Colonnes',                           level: 3, sort: 3,  weight: 1 },
          { name: 'Murs sur Chainage linteau',                               level: 3, sort: 4,  weight: 1 },
          { name: 'Chainage Poutrelle et Colonnette',                        level: 3, sort: 5,  weight: 1 },
          { name: 'Murs Pignons',                                            level: 3, sort: 6,  weight: 1 },
        ],
      },
      {
        name: 'TOITURE ET MENUISERIES EXTÉRIEURES', level: 2, sort: 3, weight: 12,
        children: [
          { name: 'Charpente en bois (Fermes, Pannes et Gitages)',           level: 3, sort: 1,  weight: 1 },
          { name: 'Couverture en tôles',                                     level: 3, sort: 2,  weight: 1 },
          { name: 'Pose des menuiseries et huisseries extérieures',          level: 3, sort: 3,  weight: 1 },
        ],
      },
      {
        name: 'ASSAINISSEMENT ET OUVRAGES CONNEXES', level: 2, sort: 4, weight: 3,
        children: [
          { name: 'Assainissements (Fosses humides ou sèches et Puits Perdus)',                                    level: 3, sort: 1,  weight: 1 },
          { name: 'Ouvrages connexes / de Protection (Fosses, Incinérateurs, Marches, Rampes, Parafouilles)',      level: 3, sort: 2,  weight: 1 },
        ],
      },
    ],
  },
  {
    name: 'TRAVAUX DE SECOND ŒUVRE', level: 1, sort: 2, weight: 25,
    children: [
      {
        name: "TRAVAUX D'ACHÈVEMENT ET INSTALLATIONS PRÉALABLES À LA FINITION", level: 2, sort: 1, weight: 25,
        children: [
          { name: 'Pose des Planches de Rive et des Plafonds sur gitages',   level: 3, sort: 1,  weight: 1 },
          { name: 'Collecte et Canalisation des eaux des toitures',          level: 3, sort: 2,  weight: 1 },
          { name: 'Installation de plomberie sanitaire',                     level: 3, sort: 3,  weight: 1 },
          { name: "Installation Électrique et d'incendie",                   level: 3, sort: 4,  weight: 1 },
          { name: 'Préparation des surfaces des murs (Crépissages)',         level: 3, sort: 5,  weight: 1 },
          { name: "Pose des menuiseries et huisseries intérieures",          level: 3, sort: 6,  weight: 1 },
          { name: 'Aménagement Extérieur',                                   level: 3, sort: 7,  weight: 1 },
        ],
      },
    ],
  },
  {
    name: 'TRAVAUX DE FINITION', level: 1, sort: 3, weight: 15,
    children: [
      {
        name: 'TRAVAUX DE CONFORT ET DE FONCTIONNALITÉ', level: 2, sort: 1, weight: 15,
        children: [
          { name: 'Pose des photovoltaïques et Appareillages Électriques',   level: 3, sort: 1,  weight: 1 },
          { name: 'Appareillage Sanitaires',                                  level: 3, sort: 2,  weight: 1 },
          { name: 'Pose des Plafonds sur Gitage',                            level: 3, sort: 3,  weight: 1 },
          { name: 'Pose des Vitres',                                         level: 3, sort: 4,  weight: 1 },
          { name: 'Pavement lissé ou en céramique sol',                      level: 3, sort: 5,  weight: 1 },
          { name: 'Céramique Murs',                                          level: 3, sort: 6,  weight: 1 },
          { name: 'Pose des Chambrales ou Moulures et Huisseries',           level: 3, sort: 7,  weight: 1 },
          { name: 'Masticage et Peinture des Murs',                          level: 3, sort: 8,  weight: 1 },
        ],
      },
    ],
  },
  {
    name: 'FOURNITURE DES ÉQUIPEMENTS', level: 1, sort: 4, weight: 10,
    children: [
      {
        name: 'MOBILIERS ET MATÉRIELS INFORMATIQUES', level: 2, sort: 1, weight: 100,
        children: [
          { name: 'Matériels Informatiques',                                 level: 3, sort: 1,  weight: 1 },
          { name: 'Mobiliers Bureau (Voir TDR)',                             level: 3, sort: 2,  weight: 1 },
          { name: 'Équipements en Bois (EP, CS et BA de Territoire)',        level: 3, sort: 3,  weight: 1 },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🧹 Nettoyage des tables dépendantes...');
  await prisma.taskResource.deleteMany({});
  await prisma.siteResource.deleteMany({});
  await prisma.projectResource.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectSite.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.site.deleteMany({});
  await prisma.territory.deleteMany({});
  console.log('✓ Tables nettoyées\n');

  // ── 1. CRÉER LES TERRITOIRES ────────────────────────────────────────────────
  const terrMap = {};
  for (const lot of LOTS) {
    const t = await prisma.territory.create({ data: { Name: lot.territory } });
    terrMap[lot.territory] = t.TerritoryID;
  }
  console.log(`✓ ${LOTS.length} territoires créés`);

  // ── 2. CRÉER TOUS LES SITES ─────────────────────────────────────────────────
  let totalSites = 0;
  const siteIdMap = {}; // siteName → SiteID

  for (const lot of LOTS) {
    for (const siteName of lot.sites) {
      const type  = siteType(siteName);
      const siteId = `${lot.terrCode}-${slugify(siteName).substring(0, 28)}`;
      await prisma.site.create({
        data: {
          SiteID:      siteId,
          Name:        siteName,
          Type:        type,
          Province:    'Maï-Ndombe',
          TerritoryID: terrMap[lot.territory],
        },
      });
      siteIdMap[`${lot.territory}::${siteName}`] = siteId;
      totalSites++;
    }
  }
  console.log(`✓ ${totalSites} sites créés`);

  // ── 3. CRÉER LE PROGRAMME ───────────────────────────────────────────────────
  const totalBudget = LOTS.reduce((sum, lot) =>
    sum + lot.sites.reduce((s2, name) => s2 + SITE_BUDGET[siteType(name)], 0), 0);

  const program = await prisma.program.create({
    data: {
      Name:        'PDL-145T — Maï-Ndombe',
      Description: "Programme de Développement Local des 145 Territoires — Province du Maï-Ndombe. " +
                   "Contrat ASCAT SPPE SARL — 4 lots de travaux (Inongo, Kutu, Mushie, Yumbi) — " +
                   "65 infrastructures sociales et administratives.",
      StartDate:   new Date('2019-07-01'),
      EndDate:     new Date('2026-12-31'),
      Budget:      totalBudget,
      Status:      'ACTIVE',
    },
  });
  console.log(`\n✓ Programme : ${program.Name}  (ID ${program.ProgramID})`);
  console.log(`  Budget    : ${totalBudget.toLocaleString()} CDF`);

  // ── 4. CRÉER 1 PROJET PAR LOT/TERRITOIRE → lier tous ses sites → tâches ─────
  let projectCount = 0;
  let taskCount    = 0;

  for (const lot of LOTS) {
    const lotBudget = lot.sites.reduce((s, n) => s + SITE_BUDGET[siteType(n)], 0);

    const project = await prisma.project.create({
      data: {
        ProgramID:   program.ProgramID,
        Name:        lot.projectName,
        Description: `Lot de travaux — ${lot.territory} — ${lot.sites.length} sites (ASCAT SPPE SARL)`,
        StartDate:   new Date(lot.startDate),
        EndDate:     new Date(lot.endDate),
        TotalBudget: lotBudget,
      },
    });
    projectCount++;

    // Lier TOUS les sites du lot au projet
    for (const siteName of lot.sites) {
      const siteId = siteIdMap[`${lot.territory}::${siteName}`];
      await prisma.projectSite.create({
        data: { ProjectID: project.ProjectID, SiteID: siteId },
      });

      // Créer les tâches hiérarchiques (3 niveaux) avec pondérations
      for (const l1 of TASK_HIERARCHY) {
        const t1 = await prisma.task.create({
          data: {
            ProjectID: project.ProjectID, SiteID: siteId,
            Name: l1.name, Level: 1, SortOrder: l1.sort,
            Weight: l1.weight, progressPercentage: 0, CompletionStatus: 'NotStarted',
          },
        });
        taskCount++;
        for (const l2 of l1.children) {
          const t2 = await prisma.task.create({
            data: {
              ProjectID: project.ProjectID, SiteID: siteId,
              ParentTaskID: t1.TaskID,
              Name: l2.name, Level: 2, SortOrder: l2.sort,
              Weight: l2.weight, progressPercentage: 0, CompletionStatus: 'NotStarted',
            },
          });
          taskCount++;
          for (const l3 of l2.children) {
            await prisma.task.create({
              data: {
                ProjectID: project.ProjectID, SiteID: siteId,
                ParentTaskID: t2.TaskID,
                Name: l3.name, Level: 3, SortOrder: l3.sort,
                Weight: l3.weight, progressPercentage: 0, CompletionStatus: 'NotStarted',
              },
            });
            taskCount++;
          }
        }
      }
    }

    const tasksPerSite = TASK_HIERARCHY.reduce((s, l1) => s + 1 + l1.children.reduce((s2, l2) => s2 + 1 + l2.children.length, 0), 0);
    console.log(`  ✓ ${lot.projectName}  (${lot.sites.length} sites × ${tasksPerSite} tâches/site)`);
  }

  // ── RÉSUMÉ ───────────────────────────────────────────────────────────────────
  const allSites = LOTS.flatMap(l => l.sites);
  const ep = allSites.filter(n => siteType(n) === 'ECOLE_PRIMAIRE').length;
  const cs = allSites.filter(n => siteType(n) === 'CENTRE_DE_SANTE').length;
  const ba = allSites.filter(n => siteType(n) === 'BATIMENT_ADMINISTRATIF').length;

  console.log('\n════════════════════════════════════════════');
  console.log('  ✅  SEED PDL-145T TERMINÉ AVEC SUCCÈS');
  console.log('════════════════════════════════════════════');
  console.log(`  Programme  : ${program.Name}`);
  console.log(`  Budget     : ${totalBudget.toLocaleString()} CDF`);
  console.log(`  Territoires: ${LOTS.length}`);
  console.log(`  Lots/Projets: ${projectCount}  (1 par territoire)`);
  console.log(`  Sites      : ${totalSites}  (EP:${ep} | CS:${cs} | BA:${ba})`);
  const tasksPerSite = TASK_HIERARCHY.reduce((s, l1) => s + 1 + l1.children.reduce((s2, l2) => s2 + 1 + l2.children.length, 0), 0);
  console.log(`  Tâches     : ${taskCount}  (${tasksPerSite} par site — 3 niveaux pondérés)`);
  console.log('════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
