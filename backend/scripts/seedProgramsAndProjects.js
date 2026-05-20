import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── DONNÉES RÉELLES PDL-145T — 65 SITES (source: TMUPDATED ODS) ─────────────

function siteType(name) {
  const n = name.toUpperCase();
  if (n.startsWith('BAT') || n.startsWith('BÂTIMENT')) return 'BATIMENT_ADMINISTRATIF';
  if (n.startsWith('CS') || n.startsWith('HGR') || n.startsWith('HOPITAL') || n.startsWith('CENTRE')) return 'CENTRE_DE_SANTE';
  return 'ECOLE_PRIMAIRE'; // EP, EP2, ECOLE, LYCEE, etc.
}

function slugify(name) {
  return name.toUpperCase()
    .replace(/[ÀÁÂÃÄÅàáâãäå]/g, 'A')
    .replace(/[ÈÉÊËèéêë]/g, 'E')
    .replace(/[ÌÍÎÏìíîï]/g, 'I')
    .replace(/[ÒÓÔÕÖòóôõö]/g, 'O')
    .replace(/[ÙÚÛÜùúûü]/g, 'U')
    .replace(/[ÇçÑñ]/g, 'C')
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Budget par type (CDF)
const BUDGETS = {
  BATIMENT_ADMINISTRATIF: 1_200_000_000,
  CENTRE_DE_SANTE:        650_000_000,
  ECOLE_PRIMAIRE:         480_000_000,
};

const RAW_SITES = {
  "Territoire d'Inongo": [
    "Bâtiment Administratif d'INONGO",
    "EP ISANGA",
    "EP IYANZA",
    "EP BONGO NSAMBELO",
    "EP MPOLE",
    "EP MPENGE",
    "EP2 SELENGE",
    "EP MATESO 2",
    "EP MPUNZO BEKE",
    "CS NSELENGE",
    "CS MBALA",
    "CS MPANZA",
    "CS NKOLO BEKE",
    "CS BOKOTE",
    "CS NTANDE MPENGE",
  ],
  "Territoire de Kutu": [
    "Bâtiment Administratif de KUTU",
    "EP TOLO1",
    "EP INUNU",
    "EP LEBAMA",
    "EP KESINA",
    "EP SEMENDWA",
    "EP KENZUMA",
    "EP KEMPILI",
    "EP KIBAMBILI",
    "CS TOLO2",
    "CS KEMPEKA",
    "CS LUMUMBA",
    "CS BOKORO",
    "CS SEMENDWA",
  ],
  "Territoire de Mushie": [
    "Bâtiment Administratif de MUSHIE",
    "EP BOLEBE",
    "EP NGATORO",
    "EP MBALI",
    "EP NSENU",
    "EP MPEMBE",
    "EP BOBOTO",
    "EP IZONO",
    "EP LIBOMA NGUBA",
    "EP MWANZA",
    "EP NSEMU",
    "CS BOBALA",
    "CS IZONO",
    "CS NKETALE",
    "CS MBAA",
    "CS NGELE NGEMO",
    "CS IKILI",
    "CS IBAA",
    "CS LADI",
    "CS LOBOBI",
  ],
  "Territoire d'Yumbi": [
    "Bâtiment Administratif de YUMBI",
    "EP BOLINGO",
    "EP NKOMBE",
    "EP BONGENDE",
    "EP KEBAKONDE",
    "EP MAMBONGO",
    "EP MOBOKO",
    "EP MONGALA",
    "EP MOVULA",
    "EP MUTEZIONO",
    "EP NGAPOKO",
    "EP SAINT MICHEL",
    "CS BOLU",
    "CS MOLENDE",
    "CS MONGAMA",
    "CS NKOLO YOKA",
  ],
};

// Build flat SITES_DATA array with SiteID, type and budget
const SITES_DATA = [];
for (const [territory, names] of Object.entries(RAW_SITES)) {
  for (const name of names) {
    const type = siteType(name);
    // Prefix territory code
    const terr = territory.toUpperCase().includes('INONGO') ? 'ING'
               : territory.toUpperCase().includes('KUTU')   ? 'KUT'
               : territory.toUpperCase().includes('MUSH')   ? 'MSH'
               :                                              'YMB';
    const id = `${terr}-${slugify(name).substring(0, 30)}`;
    SITES_DATA.push({ id, name, type, territory, province: 'Maï-Ndombe', budget: BUDGETS[type] });
  }
}

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
  const territories = {};
  const territoryNames = [...new Set(SITES_DATA.map(s => s.territory))];
  for (const name of territoryNames) {
    const t = await prisma.territory.create({ data: { Name: name } });
    territories[name] = t.TerritoryID;
  }
  console.log(`✓ ${territoryNames.length} territoires créés: ${territoryNames.join(', ')}`);

  // ── 2. CRÉER LES SITES ──────────────────────────────────────────────────────
  for (const s of SITES_DATA) {
    await prisma.site.create({
      data: {
        SiteID:      s.id,
        Name:        s.name,
        Type:        s.type,
        Province:    s.province,
        TerritoryID: territories[s.territory],
      },
    });
  }
  console.log(`✓ ${SITES_DATA.length} sites créés`);

  // ── 3. CRÉER LE PROGRAMME ───────────────────────────────────────────────────
  const totalBudget = SITES_DATA.reduce((sum, s) => sum + s.budget, 0);
  const program = await prisma.program.create({
    data: {
      Name:        'PDL-145T — Maï-Ndombe',
      Description: "Programme de Développement Local des 145 Territoires — Province du Maï-Ndombe. Construction d'infrastructures sociales et administratives dans 4 territoires : Inongo, Mushie, Yumbi et Kutu.",
      StartDate:   new Date('2019-07-01'),
      EndDate:     new Date('2026-12-31'),
      Budget:      totalBudget,
      Status:      'ACTIVE',
    },
  });
  console.log(`\n✓ Programme créé : ${program.Name} (ID ${program.ProgramID})`);
  console.log(`  Budget total : ${totalBudget.toLocaleString()} CDF`);

  // ── 4. CRÉER UN PROJET PAR SITE + LIER AU SITE + CRÉER LES TÂCHES ──────────
  const TASKS = [
    'Installation et Repli Chantier',
    'Fouilles manuelles',
    'Maçonnerie de Fondation',
    'Socles, Dès, Colonnes et chape en B-A',
    'Remblais des fondations',
    'Sous-Pavement',
    "Travaux d'élévations",
    'Charpente et Toiture',
    'Pose des menuiseries extérieures',
    'Assainissement et ouvrages connexes',
    'Plafonds et collecte eaux toitures',
    'Installation sanitaire et électrique',
    'Crépissage et menuiseries intérieures',
    'Aménagement extérieur',
    'Finitions, équipements et réception',
  ];

  let taskCount = 0;
  for (const s of SITES_DATA) {
    const project = await prisma.project.create({
      data: {
        ProgramID:   program.ProgramID,
        Name:        s.name,
        Description: `Projet de construction — ${s.territory} — Type: ${s.type}`,
        StartDate:   new Date('2020-01-15'),
        EndDate:     new Date('2025-12-31'),
        TotalBudget: s.budget,
      },
    });

    await prisma.projectSite.create({
      data: { ProjectID: project.ProjectID, SiteID: s.id },
    });

    for (let i = 0; i < TASKS.length; i++) {
      await prisma.task.create({
        data: {
          ProjectID:          project.ProjectID,
          SiteID:             s.id,
          Name:               TASKS[i],
          Level:              1,
          SortOrder:          i + 1,
          progressPercentage: 0,
          CompletionStatus:   'NotStarted',
        },
      });
      taskCount++;
    }
  }

  console.log(`✓ ${SITES_DATA.length} projets créés`);
  console.log(`✓ ${taskCount} tâches créées (${TASKS.length} par site)`);

  // ── RÉSUMÉ ──────────────────────────────────────────────────────────────────
  const ep = SITES_DATA.filter(s => s.type === 'ECOLE_PRIMAIRE').length;
  const cs = SITES_DATA.filter(s => s.type === 'CENTRE_DE_SANTE').length;
  const ba = SITES_DATA.filter(s => s.type === 'BATIMENT_ADMINISTRATIF').length;

  console.log('\n════════════════════════════════════════════');
  console.log('  ✅  SEED PDL-145T TERMINÉ AVEC SUCCÈS');
  console.log('════════════════════════════════════════════');
  console.log(`  Programme  : ${program.Name}`);
  console.log(`  Budget     : ${totalBudget.toLocaleString()} CDF`);
  console.log(`  Territoires: ${territoryNames.length}`);
  console.log(`  Sites      : ${SITES_DATA.length}  (EP:${ep} | CS:${cs} | BA:${ba})`);
  console.log(`  Projets    : ${SITES_DATA.length}`);
  console.log(`  Tâches     : ${taskCount}`);
  console.log('════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
