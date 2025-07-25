import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(import.meta.dirname, '..', '.env') });

const prisma = new PrismaClient();

async function validateDataPopulation() {
  try {
    console.log('=== POSTGRESQL DATA VALIDATION ===\n');
    
    // Query 1: Total count of sites
    const totalSiteCount = await prisma.site.count();
    console.log(`Total Site count: ${totalSiteCount}`);
    console.log(`Expected: 65 ${totalSiteCount === 65 ? '✓' : '✗'}\n`);
    
    // Query 2: Sites grouped by territory
    const sitesByTerritory = await prisma.$queryRaw`
      SELECT t."Name" as name, COUNT(s."SiteID")::int as count 
      FROM "Site" s 
      JOIN "Territory" t USING ("TerritoryID") 
      GROUP BY t."Name" 
      ORDER BY t."Name"
    `;
    
    console.log('Sites by Territory:');
    const expectedCounts = {
      'INONGO': 15,
      'KUTU': 13, 
      'MUSHIE': 20,
      'YUMBI': 17
    };
    
    let totalFromTerritories = 0;
    for (const row of sitesByTerritory) {
      const expected = expectedCounts[row.name] || 'unknown';
      const isMatch = expected === row.count;
      totalFromTerritories += row.count;
      console.log(`  ${row.name}: ${row.count} (expected: ${expected}) ${isMatch ? '✓' : '✗'}`);
    }
    
    console.log(`\nTotal from territories: ${totalFromTerritories}`);
    console.log(`Matches total count: ${totalFromTerritories === totalSiteCount ? '✓' : '✗'}\n`);
    
    // Query 3: Check random geometry data
    console.log('Sample location data:');
    const geometryData = await prisma.$queryRaw`
      SELECT "SiteID", "Name", "Location"
      FROM "Site" 
      WHERE "Location" IS NOT NULL 
      LIMIT 5
    `;
    
    for (const row of geometryData) {
      console.log(`  ${row.SiteID} (${row.Name}): ${row.Location}`);
    }
    
    // Additional validation: Check for sites without location
    const sitesWithoutLocation = await prisma.site.count({
      where: {
        Location: null
      }
    });
    
    console.log(`\nSites without location data: ${sitesWithoutLocation}`);
    
    console.log('\n=== VALIDATION SUMMARY ===');
    const allMatch = totalSiteCount === 65 && 
                    sitesByTerritory.every(row => expectedCounts[row.name] === row.count);
    
    console.log(`Total sites: ${totalSiteCount}/65 ${totalSiteCount === 65 ? '✓' : '✗'}`);
    console.log(`Territory distribution: ${allMatch ? '✓' : '✗'}`);
    console.log(`Sites with geometry: ${totalSiteCount - sitesWithoutLocation}/${totalSiteCount}`);
    
    if (allMatch) {
      console.log('\n🎉 All validations passed!');
    } else {
      console.log('\n⚠️  Some validations failed - check the data above.');
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
validateDataPopulation()
  .catch(console.error);
