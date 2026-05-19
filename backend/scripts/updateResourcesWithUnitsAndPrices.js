import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // Read the materials file to extract units
  const materialsData = readFileSync(join(__dirname, '../../materials_extracted.txt'), 'utf-8');
  const lines = materialsData.split('\n');
  
  const materialUnits = new Map();
  let currentSection = '';
  
  for (const line of lines) {
    if (line.includes('MATÉRIAUX MANUFACTURÉS')) {
      currentSection = 'manufactured';
    } else if (line.includes('MATÉRIAUX LOCAUX')) {
      currentSection = 'local';
    } else if (line.includes('ÉQUIPEMENTS')) {
      currentSection = 'equipment';
    } else if (line.startsWith('- ') && currentSection) {
      const material = line.substring(2);
      const match = material.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        const name = match[1].trim();
        const unit = match[2].trim();
        materialUnits.set(name, unit);
      }
    }
  }
  
  // Update PERSONNE resources with unit "H/J"
  await prisma.resource.updateMany({
    where: { Type: 'PERSONNE' },
    data: { Unit: 'H/J' },
  });
  console.log('✓ Updated PERSONNE resources with Unit: H/J');
  
  // Update MATÉRIEL resources with units from the Excel file
  const materials = await prisma.resource.findMany({
    where: { Type: 'MATÉRIEL' },
  });
  
  let updatedMaterials = 0;
  for (const material of materials) {
    const unit = materialUnits.get(material.Name);
    if (unit) {
      await prisma.resource.update({
        where: { ResourceID: material.ResourceID },
        data: { Unit: unit },
      });
      updatedMaterials++;
    }
  }
  console.log(`✓ Updated ${updatedMaterials} MATÉRIEL resources with units`);
  
  // Update EQUIPEMENT resources with units from the Excel file
  const equipment = await prisma.resource.findMany({
    where: { Type: 'EQUIPEMENT' },
  });
  
  let updatedEquipment = 0;
  for (const equip of equipment) {
    const unit = materialUnits.get(equip.Name);
    if (unit) {
      await prisma.resource.update({
        where: { ResourceID: equip.ResourceID },
        data: { Unit: unit },
      });
      updatedEquipment++;
    }
  }
  console.log(`✓ Updated ${updatedEquipment} EQUIPEMENT resources with units`);
  
  // Set default PurchaseType for equipment (default to ACHETER)
  await prisma.resource.updateMany({
    where: { Type: 'EQUIPEMENT', PurchaseType: null },
    data: { PurchaseType: 'ACHETER' },
  });
  console.log('✓ Set default PurchaseType for EQUIPEMENT resources');
  
  console.log('\n✅ All resources updated with units and purchase types!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
