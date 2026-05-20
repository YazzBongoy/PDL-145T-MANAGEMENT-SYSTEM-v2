import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── DONNÉES PDL-145T : 65 SITES (4 Territoires Maï-Ndombe + Kinshasa) ──────
const SITES_DATA = [
  // TERRITOIRE DE INONGO (22 sites)
  { id: 'INONGO-EP-001', name: 'EP INONGO CENTRE',        type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 500_000_000 },
  { id: 'INONGO-EP-002', name: 'EP SELENGE',              type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 480_000_000 },
  { id: 'INONGO-EP-003', name: 'EP MATESO 2',             type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 460_000_000 },
  { id: 'INONGO-EP-004', name: 'EP MPUNZOBEKE',           type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 450_000_000 },
  { id: 'INONGO-EP-005', name: 'EP IYANZA',               type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 440_000_000 },
  { id: 'INONGO-EP-006', name: 'EP ISANGA',               type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 440_000_000 },
  { id: 'INONGO-EP-007', name: 'EP BONGO NSAMBELO',       type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 430_000_000 },
  { id: 'INONGO-EP-008', name: 'EP NKAKE',                type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 430_000_000 },
  { id: 'INONGO-EP-009', name: 'EP LOSANGANYA',           type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 420_000_000 },
  { id: 'INONGO-EP-010', name: 'EP MPAMA',                type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 420_000_000 },
  { id: 'INONGO-CS-001', name: 'CS INONGO CENTRE',        type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 650_000_000 },
  { id: 'INONGO-CS-002', name: 'CS KOLE-KOLE',            type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 620_000_000 },
  { id: 'INONGO-CS-003', name: 'CS EBONDA',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 600_000_000 },
  { id: 'INONGO-CS-004', name: 'CS KANDA-KANDA',          type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 590_000_000 },
  { id: 'INONGO-CS-005', name: 'CS ISONGO',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 580_000_000 },
  { id: 'INONGO-CS-006', name: 'CS LOKANGA',              type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 570_000_000 },
  { id: 'INONGO-CS-007', name: 'CS NSONGO',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 560_000_000 },
  { id: 'INONGO-CS-008', name: 'CS MBELO',                type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 550_000_000 },
  { id: 'INONGO-BA-001', name: 'BAT ADM INONGO',          type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 1_800_000_000 },
  { id: 'INONGO-BA-002', name: 'BAT ADM KOLE-KOLE',       type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 950_000_000 },
  { id: 'INONGO-BA-003', name: 'BAT ADM EBONDA',          type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 900_000_000 },
  { id: 'INONGO-HGR-001', name: 'HGR INONGO',             type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Inongo",  budget: 2_500_000_000 },

  // TERRITOIRE DE MUSHIE (17 sites)
  { id: 'MUSHIE-EP-001', name: 'EP MUSHIE CENTRE',        type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 450_000_000 },
  { id: 'MUSHIE-EP-002', name: 'EP MOKE',                 type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 430_000_000 },
  { id: 'MUSHIE-EP-003', name: 'EP MABOKI',               type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 420_000_000 },
  { id: 'MUSHIE-EP-004', name: 'EP BIKORO',               type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 410_000_000 },
  { id: 'MUSHIE-EP-005', name: 'EP BOTONGO',              type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 400_000_000 },
  { id: 'MUSHIE-CS-001', name: 'CS MUSHIE CENTRE',        type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 650_000_000 },
  { id: 'MUSHIE-CS-002', name: 'CS MOKE',                 type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 580_000_000 },
  { id: 'MUSHIE-CS-003', name: 'CS MABOKI',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 560_000_000 },
  { id: 'MUSHIE-CS-004', name: 'CS BIKORO',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 540_000_000 },
  { id: 'MUSHIE-CS-005', name: 'CS BOTONGO',              type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 520_000_000 },
  { id: 'MUSHIE-CS-006', name: 'CS LOSANO',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 500_000_000 },
  { id: 'MUSHIE-CS-007', name: 'CS NKOKO',                type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 490_000_000 },
  { id: 'MUSHIE-BA-001', name: 'BAT ADM MUSHIE',          type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 1_200_000_000 },
  { id: 'MUSHIE-BA-002', name: 'BAT ADM MOKE',            type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 800_000_000 },
  { id: 'MUSHIE-BA-003', name: 'BAT ADM MABOKI',          type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 780_000_000 },
  { id: 'MUSHIE-ES-001', name: 'ECOLE SEC TECH MUSHIE',   type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 850_000_000 },
  { id: 'MUSHIE-HGR-001', name: 'HGR MUSHIE',             type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Mushie', budget: 2_200_000_000 },

  // TERRITOIRE DE YUMBI (10 sites)
  { id: 'YUMBI-EP-001', name: 'EP YUMBI CENTRE',          type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 480_000_000 },
  { id: 'YUMBI-EP-002', name: 'EP NGIRI-NGIRI',           type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 440_000_000 },
  { id: 'YUMBI-EP-003', name: 'EP YAMBA-YAMBA',           type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 400_000_000 },
  { id: 'YUMBI-CS-001', name: 'CS YUMBI CENTRE',          type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 720_000_000 },
  { id: 'YUMBI-CS-002', name: 'CS NGIRI-NGIRI',           type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 600_000_000 },
  { id: 'YUMBI-CS-003', name: 'CS YAMBA-YAMBA',           type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 560_000_000 },
  { id: 'YUMBI-BA-001', name: 'BAT ADM YUMBI',            type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 950_000_000 },
  { id: 'YUMBI-HGR-001', name: 'HGR YUMBI',               type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 1_800_000_000 },
  { id: 'YUMBI-ES-001', name: 'ECOLE SEC YUMBI',          type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 680_000_000 },
  { id: 'YUMBI-BA-002', name: 'BAT ADM NGIRI-NGIRI',      type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: "Territoire d'Yumbi",   budget: 750_000_000 },

  // TERRITOIRE DE KUTU (16 sites)
  { id: 'KUTU-EP-001', name: 'EP KUTU CENTRE',            type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 420_000_000 },
  { id: 'KUTU-EP-002', name: 'EP BOKUNGU',                type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 400_000_000 },
  { id: 'KUTU-EP-003', name: 'EP IFUMI',                  type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 380_000_000 },
  { id: 'KUTU-EP-004', name: 'EP BOSHWE',                 type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 370_000_000 },
  { id: 'KUTU-CS-001', name: 'CS KUTU CENTRE',            type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 580_000_000 },
  { id: 'KUTU-CS-002', name: 'CS BOKUNGU',                type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 540_000_000 },
  { id: 'KUTU-CS-003', name: 'CS IFUMI',                  type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 510_000_000 },
  { id: 'KUTU-CS-004', name: 'CS BOSHWE',                 type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 490_000_000 },
  { id: 'KUTU-CS-005', name: 'CS KIMBUTA',                type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 470_000_000 },
  { id: 'KUTU-CS-006', name: 'CS LOKANGA-KUTU',           type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 460_000_000 },
  { id: 'KUTU-BA-001', name: 'BAT ADM KUTU',              type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 1_100_000_000 },
  { id: 'KUTU-BA-002', name: 'BAT ADM BOKUNGU',           type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 800_000_000 },
  { id: 'KUTU-BA-003', name: 'BAT ADM IFUMI',             type: 'BATIMENT_ADMINISTRATIF', province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 750_000_000 },
  { id: 'KUTU-ES-001', name: 'ECOLE SEC KUTU',            type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 680_000_000 },
  { id: 'KUTU-ES-002', name: 'ECOLE SEC TECH KUTU',       type: 'ECOLE_PRIMAIRE',         province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 850_000_000 },
  { id: 'KUTU-HGR-001', name: 'HGR KUTU',                 type: 'CENTRE_DE_SANTE',        province: 'Maï-Ndombe', territory: 'Territoire de Kutu',   budget: 2_000_000_000 },
];

// Tâches de construction standard (hiérarchie 3 niveaux)
function buildTasks(projectID, siteID) {
  return [
    // Niveau 1
    { name: 'Installation du chantier',       lvl: 1, sort: 1,  pct: 0, parent: null },
    { name: 'Fouilles et terrassement',        lvl: 1, sort: 2,  pct: 0, parent: null },
    { name: 'Maçonnerie fondations',           lvl: 1, sort: 3,  pct: 0, parent: null },
    { name: 'Socles et colonnes',              lvl: 1, sort: 4,  pct: 0, parent: null },
    { name: 'Remblais',                        lvl: 1, sort: 5,  pct: 0, parent: null },
    { name: 'Sous pavement',                   lvl: 1, sort: 6,  pct: 0, parent: null },
    { name: 'Structure et charpente',          lvl: 1, sort: 7,  pct: 0, parent: null },
    { name: 'Toiture',                         lvl: 1, sort: 8,  pct: 0, parent: null },
    { name: 'Installation électrique',         lvl: 1, sort: 9,  pct: 0, parent: null },
    { name: 'Installation sanitaire',          lvl: 1, sort: 10, pct: 0, parent: null },
    { name: 'Menuiseries',                     lvl: 1, sort: 11, pct: 0, parent: null },
    { name: 'Finitions intérieures',           lvl: 1, sort: 12, pct: 0, parent: null },
    { name: 'Finitions extérieures',           lvl: 1, sort: 13, pct: 0, parent: null },
    { name: 'Aménagement et accès',            lvl: 1, sort: 14, pct: 0, parent: null },
    { name: 'Réception et remise',             lvl: 1, sort: 15, pct: 0, parent: null },
  ];
}

async function main() {
  console.log('🧹 Nettoyage: suppression des programmes, projets et sites existants...');
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
  console.log(`✓ ${territoryNames.length} territoires créés`);

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
  const program = await prisma.program.create({
    data: {
      Name:        'PDL-145T — Maï-Ndombe',
      Description: "Programme de Développement Local des 145 Territoires — Province du Maï-Ndombe. Construction d'infrastructures sociales et administratives dans 4 territoires : Inongo, Mushie, Yumbi et Kutu.",
      StartDate:   new Date('2019-07-01'),
      EndDate:     new Date('2026-12-31'),
      Budget:      57_700_000_000,
      Status:      'ACTIVE',
    },
  });
  console.log(`\n✓ Programme créé : ${program.Name} (ID ${program.ProgramID})`);

  // ── 4. CRÉER UN PROJET PAR SITE + LIER AU SITE ──────────────────────────────
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

    // Lier le projet au site
    await prisma.projectSite.create({
      data: { ProjectID: project.ProjectID, SiteID: s.id },
    });

    // Créer les tâches de construction (niveau 1 uniquement pour performance)
    const taskDefs = buildTasks(project.ProjectID, s.id);
    for (const t of taskDefs) {
      await prisma.task.create({
        data: {
          ProjectID:         project.ProjectID,
          SiteID:            s.id,
          Name:              t.name,
          Level:             t.lvl,
          SortOrder:         t.sort,
          progressPercentage: t.pct,
          CompletionStatus:  'NotStarted',
        },
      });
      taskCount++;
    }
  }

  console.log(`✓ ${SITES_DATA.length} projets créés (1 par site)`);
  console.log(`✓ ${taskCount} tâches de construction créées`);

  // ── RÉSUMÉ ──────────────────────────────────────────────────────────────────
  const ep  = SITES_DATA.filter(s => s.type === 'ECOLE_PRIMAIRE').length;
  const cs  = SITES_DATA.filter(s => s.type === 'CENTRE_DE_SANTE').length;
  const ba  = SITES_DATA.filter(s => s.type === 'BATIMENT_ADMINISTRATIF').length;

  console.log('\n════════════════════════════════════════════');
  console.log('  ✅  SEED PDL-145T TERMINÉ AVEC SUCCÈS');
  console.log('════════════════════════════════════════════');
  console.log(`  Programme : ${program.Name}`);
  console.log(`  Budget    : ${(program.Budget).toLocaleString()} CDF`);
  console.log(`  Territoires : ${territoryNames.length}`);
  console.log(`  Sites     : ${SITES_DATA.length}  (EP:${ep} | CS:${cs} | BA:${ba})`);
  console.log(`  Projets   : ${SITES_DATA.length}`);
  console.log(`  Tâches    : ${taskCount}`);
  console.log('════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
