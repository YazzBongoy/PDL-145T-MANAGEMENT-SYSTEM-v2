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

// Tâches de construction standard pour chaque site (source: TMUPDATED PLANNING)
const TASKS = [
  { name: 'Installation et Repli Chantier',            sort: 1 },
  { name: 'Fouilles manuelles en section',             sort: 2 },
  { name: 'Maçonnerie de Fondation',                   sort: 3 },
  { name: 'Socles, Dès, Colonnes et chape en B-A',     sort: 4 },
  { name: 'Remblais des fondations',                   sort: 5 },
  { name: 'Sous-Pavement',                             sort: 6 },
  { name: "Murs d'élévations",                         sort: 7 },
  { name: 'Charpente en bois et Couverture',           sort: 8 },
  { name: 'Menuiseries extérieures',                   sort: 9 },
  { name: 'Collecte eaux et Assainissement',           sort: 10 },
  { name: 'Installation sanitaire et électrique',      sort: 11 },
  { name: 'Plafonds et Crépissage',                    sort: 12 },
  { name: 'Menuiseries intérieures et Peinture',       sort: 13 },
  { name: 'Aménagement extérieur',                     sort: 14 },
  { name: 'Fourniture équipements et réception',       sort: 15 },
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

      // Créer les 15 tâches de construction pour ce site dans ce projet
      for (const task of TASKS) {
        await prisma.task.create({
          data: {
            ProjectID:          project.ProjectID,
            SiteID:             siteId,
            Name:               task.name,
            Level:              1,
            SortOrder:          task.sort,
            progressPercentage: 0,
            CompletionStatus:   'NotStarted',
          },
        });
        taskCount++;
      }
    }

    console.log(`  ✓ ${lot.projectName}  (${lot.sites.length} sites, ${lot.sites.length * TASKS.length} tâches)`);
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
  console.log(`  Tâches     : ${taskCount}  (${TASKS.length} par site)`);
  console.log('════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
