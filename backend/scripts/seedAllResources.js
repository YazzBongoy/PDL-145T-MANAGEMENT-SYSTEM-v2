import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();

// Generate serial number: PREFIX-XXXXXX (e.g., PRS-000001)
function serial(prefix, index) {
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

async function main() {
  // Delete all existing resources
  await prisma.resource.deleteMany({});
  console.log('✓ Existing resources cleared\n');

  let idx = 1;

  // ─── PERSONNE ───────────────────────────────────────────────
  const personResources = [
    { Name: 'Chef équipe',    Quantity: 5,  Description: "Chef d'équipe de chantier" },
    { Name: 'Terrassier',     Quantity: 10, Description: 'Ouvrier terrassier' },
    { Name: 'Manœuvre',       Quantity: 15, Description: 'Ouvrier manœuvre' },
    { Name: 'Maçon',          Quantity: 12, Description: 'Maçon général' },
    { Name: 'Aide maçon',     Quantity: 10, Description: 'Aide maçon' },
    { Name: 'Coffreur',       Quantity: 8,  Description: 'Ouvrier coffreur' },
    { Name: 'Ferrailleur',    Quantity: 8,  Description: 'Ouvrier ferrailleur' },
    { Name: 'Charpentier',    Quantity: 6,  Description: 'Charpentier bois' },
    { Name: 'Couvreur',       Quantity: 6,  Description: 'Couvreur tôles' },
    { Name: 'Soudeur',        Quantity: 4,  Description: 'Soudeur métallique' },
    { Name: 'Maçon finisseur',Quantity: 5,  Description: 'Maçon spécialiste finitions' },
    { Name: 'Peintre',        Quantity: 4,  Description: 'Peintre bâtiment' },
  ].map(r => ({ ...r, Type: 'PERSONNE', Unit: 'H/J', SerialNumber: serial('PRS', idx++) }));

  for (const r of personResources) {
    await prisma.resource.create({ data: r });
  }
  console.log(`✓ ${personResources.length} ressources PERSONNE créées`);

  // ─── EQUIPEMENT ─────────────────────────────────────────────
  const equipmentResources = [
    { Name: 'Pelle',           Quantity: 10, Description: 'Pelle manuelle',           Unit: 'pce' },
    { Name: 'Pioche',          Quantity: 10, Description: 'Pioche manuelle',           Unit: 'pce' },
    { Name: 'Brouette',        Quantity: 15, Description: 'Brouette pour transport',   Unit: 'pce' },
    { Name: 'Bétonnière',      Quantity: 3,  Description: 'Bétonnière électrique',     Unit: 'pce' },
    { Name: 'Vibrateur',       Quantity: 2,  Description: 'Vibrateur à béton',         Unit: 'pce' },
    { Name: 'Truelle',         Quantity: 20, Description: 'Truelle maçon',             Unit: 'pce' },
    { Name: 'Niveau à bulle',  Quantity: 5,  Description: 'Niveau à bulle',            Unit: 'pce' },
    { Name: 'Dame',            Quantity: 3,  Description: 'Dame de compactage',        Unit: 'pce' },
    { Name: 'Arrosoir',        Quantity: 5,  Description: 'Arrosoir pour béton',       Unit: 'pce' },
    { Name: 'Cutter',          Quantity: 10, Description: 'Cutter pour film polyane',  Unit: 'pce' },
    { Name: 'Scie à bois',     Quantity: 5,  Description: 'Scie à bois',               Unit: 'pce' },
    { Name: 'Marteau',         Quantity: 10, Description: 'Marteau',                   Unit: 'pce' },
    { Name: 'Échelle',         Quantity: 4,  Description: 'Échelle télescopique',      Unit: 'pce' },
    { Name: 'Poste à souder',  Quantity: 2,  Description: 'Poste à souder portable',   Unit: 'pce' },
    { Name: 'Meuleuse',        Quantity: 3,  Description: "Meuleuse d'angle",          Unit: 'pce' },
    { Name: 'Taloche',         Quantity: 10, Description: 'Taloche pour enduit',       Unit: 'pce' },
    { Name: 'Rouleau',         Quantity: 8,  Description: 'Rouleau à peinture',        Unit: 'pce' },
    { Name: 'Coffrage',        Quantity: 20, Description: 'Coffrage modulaire',        Unit: 'm²'  },
    { Name: 'Bois de coffrage',Quantity: 10, Description: 'Bois de coffrage',          Unit: 'm³'  },
  ].map(r => ({ ...r, Type: 'EQUIPEMENT', PurchaseType: 'ACHETER', SerialNumber: serial('EQP', idx++) }));

  for (const r of equipmentResources) {
    await prisma.resource.create({ data: r });
  }
  console.log(`✓ ${equipmentResources.length} ressources EQUIPEMENT créées`);

  // ─── MATÉRIEL (depuis fichier Excel extrait) ─────────────────
  const materialsFile = join(__dirname, '../../materials_extracted.txt');
  const data = readFileSync(materialsFile, 'utf-8');
  const lines = data.split('\n');

  const materialResources = [];
  let currentSection = '';

  for (const line of lines) {
    if (line.includes('MATÉRIAUX MANUFACTURÉS')) { currentSection = 'mfg'; continue; }
    if (line.includes('MATÉRIAUX LOCAUX'))       { currentSection = 'local'; continue; }
    if (line.includes('ÉQUIPEMENTS'))            { currentSection = ''; continue; }

    if (line.startsWith('- ') && (currentSection === 'mfg' || currentSection === 'local')) {
      const material = line.substring(2).trim();
      // Extract last parenthesized unit
      const match = material.match(/^(.*)\(([^()]+)\)\s*$/);
      if (match) {
        const name = match[1].trim();
        const unit = match[2].trim();
        const descPrefix = currentSection === 'mfg' ? 'Matériel manufacturé' : 'Matériel local';
        materialResources.push({
          Name: name,
          Type: 'MATÉRIEL',
          Quantity: 1,
          Unit: unit,
          Description: `${descPrefix} — Unité: ${unit}`,
          SerialNumber: serial('MAT', idx++),
        });
      }
    }
  }

  for (const r of materialResources) {
    await prisma.resource.create({ data: r });
  }
  console.log(`✓ ${materialResources.length} ressources MATÉRIEL créées`);

  const total = personResources.length + equipmentResources.length + materialResources.length;
  console.log(`\n✅ Total: ${total} ressources créées avec numéros de série (PRS-XXXXXX, EQP-XXXXXX, MAT-XXXXXX)`);
}

main()
  .catch(e => { console.error('Erreur:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
