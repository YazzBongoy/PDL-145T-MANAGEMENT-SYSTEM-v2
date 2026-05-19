import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // Read the extracted materials file
  const fs = await import('fs');
  const data = fs.readFileSync(join(__dirname, '../../materials_extracted.txt'), 'utf-8');
  
  const lines = data.split('\n');
  let currentSection = '';
  const materialsManufactured = [];
  const materialsLocal = [];
  const equipment = [];
  
  for (const line of lines) {
    if (line.includes('MATÉRIAUX MANUFACTURÉS')) {
      currentSection = 'manufactured';
    } else if (line.includes('MATÉRIAUX LOCAUX')) {
      currentSection = 'local';
    } else if (line.includes('ÉQUIPEMENTS')) {
      currentSection = 'equipment';
    } else if (line.startsWith('- ') && currentSection) {
      const material = line.substring(2);
      // Extract name and unit
      const match = material.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        const name = match[1].trim();
        const unit = match[2].trim();
        
        if (currentSection === 'manufactured') {
          materialsManufactured.push({ Name: name, Type: 'MATÉRIEL', Quantity: 10, Description: `Matériel manufacturé - Unité: ${unit}` });
        } else if (currentSection === 'local') {
          materialsLocal.push({ Name: name, Type: 'MATÉRIEL', Quantity: 10, Description: `Matériel local - Unité: ${unit}` });
        } else if (currentSection === 'equipment') {
          equipment.push({ Name: name, Type: 'EQUIPEMENT', Quantity: 5, Description: `Équipement - Unité: ${unit}` });
        }
      }
    }
  }
  
  console.log(`Found ${materialsManufactured.length} manufactured materials`);
  console.log(`Found ${materialsLocal.length} local materials`);
  console.log(`Found ${equipment.length} equipment`);
  
  // Create materials (manufactured and local combined)
  const allMaterials = [...materialsManufactured, ...materialsLocal];
  
  console.log('\nCreating MATÉRIEL resources...');
  await prisma.resource.createMany({
    data: allMaterials,
    skipDuplicates: true,
  });
  console.log(`  ✓ ${allMaterials.length} MATÉRIEL resources created`);
  
  console.log('\nCreating additional EQUIPEMENT resources...');
  await prisma.resource.createMany({
    data: equipment,
    skipDuplicates: true,
  });
  console.log(`  ✓ ${equipment.length} EQUIPEMENT resources created`);
  
  console.log('\n✅ All materials and equipment created successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
