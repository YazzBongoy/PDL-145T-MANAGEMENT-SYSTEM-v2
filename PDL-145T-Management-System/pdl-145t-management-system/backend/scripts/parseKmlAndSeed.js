import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.join(import.meta.dirname, '..', '.env') });

const prisma = new PrismaClient();

/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - The text to slugify
 * @returns {string} - The slugified text
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Extracts type from description using regex
 * @param {string} description - The description text
 * @returns {string|null} - The extracted type or null if not found
 */
function extractType(description) {
  if (!description) return null;
  
  const typePatterns = [
    { pattern: /centre\s+de\s+sant[eé]/i, value: 'CENTRE_DE_SANTE' },
    { pattern: /[eé]cole\s+primaire/i, value: 'ECOLE_PRIMAIRE' },
    { pattern: /b[aâ]timent\s+administratif/i, value: 'BATIMENT_ADMINISTRATIF' }
  ];
  
  for (const { pattern, value } of typePatterns) {
    if (pattern.test(description)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Extracts territory from description using regex
 * @param {string} description - The description text
 * @returns {string|null} - The extracted territory or null if not found
 */
function extractTerritory(description) {
  if (!description) return null;
  
  // Look for territory patterns - assuming territories are mentioned in descriptions
  // This regex looks for common patterns like "Territory: X", "Territoire: X", or "Zone: X"
  const territoryPatterns = [
    /territoire[:\s]+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,
    /territory[:\s]+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,
    /zone[:\s]+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,
    /secteur[:\s]+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,
    /région[:\s]+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,
    /region[:\s]+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i
  ];
  
  for (const pattern of territoryPatterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // If no explicit territory pattern found, try to extract from common location indicators
  const locationPatterns = [
    /à\s+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,      // "à Location"
    /in\s+([a-zA-ZÀ-ÿ\s\-_0-9]+)/i,     // "in Location"
    /([a-zA-ZÀ-ÿ\s\-_0-9]+)\s+area/i,   // "Location area"
    /([a-zA-ZÀ-ÿ\s\-_0-9]+)\s+district/i // "Location district"
  ];
  
  for (const pattern of locationPatterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Parses coordinates string and extracts longitude, latitude, and elevation
 * @param {string} coordinatesStr - The coordinates string from KML
 * @returns {object} - Object with lon, lat, and elev properties
 */
function parseCoordinates(coordinatesStr) {
  if (!coordinatesStr) {
    return { lon: null, lat: null, elev: null };
  }
  
  // KML coordinates are in the format: longitude,latitude,elevation
  // Multiple coordinates are separated by spaces or newlines
  const coords = coordinatesStr.trim().split(/[\s\n]+/)[0]; // Take first coordinate if multiple
  const parts = coords.split(',');
  
  if (parts.length >= 2) {
    return {
      lon: parseFloat(parts[0]) || null,
      lat: parseFloat(parts[1]) || null,
      elev: parts.length >= 3 ? parseFloat(parts[2]) || null : null
    };
  }
  
  return { lon: null, lat: null, elev: null };
}

/**
 * Generates a unique Site ID based on name and territory
 * @param {string} name - The site name
 * @param {string} territory - The territory name
 * @param {number} index - The index for uniqueness
 * @returns {string} - The generated Site ID
 */
function generateSiteID(name, territory, index) {
  if (name) {
    const slug = slugify(name);
    if (slug) {
      return slug;
    }
  }
  
  if (territory) {
    const territorySlug = slugify(territory);
    return `${territorySlug}_${index + 1}`;
  }
  
  return `site_${index + 1}`;
}

/**
 * Seeds the database with the four required territories
 * @returns {Promise<void>}
 */
async function seedTerritories() {
  const territories = ['INONGO', 'KUTU', 'MUSHIE', 'YUMBI'];
  
  console.log('Seeding territories...');
  
  for (const territoryName of territories) {
    try {
      const territory = await prisma.territory.upsert({
        where: { Name: territoryName },
        update: {},
        create: { Name: territoryName }
      });
      console.log(`✓ Territory upserted: ${territory.Name} (ID: ${territory.TerritoryID})`);
    } catch (error) {
      console.error(`✗ Error upserting territory ${territoryName}:`, error.message);
      throw error;
    }
  }
}

/**
 * Seeds the database with sites
 * @param {Array} sites - Array of site objects
 * @returns {Promise<void>}
 */
async function seedSites(sites) {
  console.log(`Seeding ${sites.length} sites...`);
  
  let createdCount = 0;
  let errorCount = 0;
  
  for (const site of sites) {
    try {
      const { SiteID, Name, Type, Territory, Coordinates, Elevation } = site;
      const { longitude: lon, latitude: lat } = Coordinates;
      
      // Map territory name (handling case variations and fallbacks)
      let territoryName = Territory?.toUpperCase();
      const validTerritories = ['INONGO', 'KUTU', 'MUSHIE', 'YUMBI'];
      
      if (!validTerritories.includes(territoryName)) {
        // Try to match partially
        const matchedTerritory = validTerritories.find(t => 
          territoryName?.includes(t) || t.includes(territoryName || '')
        );
        territoryName = matchedTerritory || 'INONGO'; // Default fallback
        console.log(`⚠ Mapped territory '${Territory}' to '${territoryName}' for site ${SiteID}`);
      }
      
      // Create site using Prisma ORM approach (matching current schema)
      const createdSite = await prisma.site.upsert({
        where: { SiteID },
        update: {
          Name,
          Type,
          Province: 'MAI NDOMBE',
          Territory: { connect: { Name: territoryName } },
          Location: (lon && lat) ? `SRID=4326;POINT(${lon} ${lat})` : null,
          Elevation: Elevation || null,
          UpdatedAt: new Date()
        },
        create: {
          SiteID,
          Name,
          Type,
          Province: 'MAI NDOMBE',
          Territory: { connect: { Name: territoryName } },
          Location: (lon && lat) ? `SRID=4326;POINT(${lon} ${lat})` : null,
          Elevation: Elevation || null
        }
      });
      
      console.log(`✓ Site created/updated: ${Name} (${SiteID}) in ${territoryName}`);
      createdCount++;
    } catch (error) {
      console.error(`✗ Error creating site ${site.SiteID}:`, error.message);
      errorCount++;
      // Continue with next site instead of throwing
    }
  }
  
  console.log(`\n=== SEEDING SUMMARY ===`);
  console.log(`✓ Sites created/updated: ${createdCount}`);
  console.log(`✗ Sites with errors: ${errorCount}`);
}

/**
 * Alternative approach: Seeds sites using raw SQL with PostGIS geometry
 * @param {Array} sites - Array of site objects
 * @returns {Promise<void>}
 */
async function seedSitesWithPostGIS(sites) {
  console.log(`Seeding ${sites.length} sites with PostGIS geometry...`);
  
  let createdCount = 0;
  let errorCount = 0;
  
  for (const site of sites) {
    try {
      const { SiteID, Name, Type, Territory, Coordinates, Elevation } = site;
      const { longitude: lon, latitude: lat } = Coordinates;
      
      // Map territory name (handling case variations and fallbacks)
      let territoryName = Territory?.toUpperCase();
      const validTerritories = ['INONGO', 'KUTU', 'MUSHIE', 'YUMBI'];
      
      if (!validTerritories.includes(territoryName)) {
        // Try to match partially
        const matchedTerritory = validTerritories.find(t => 
          territoryName?.includes(t) || t.includes(territoryName || '')
        );
        territoryName = matchedTerritory || 'INONGO'; // Default fallback
        console.log(`⚠ Mapped territory '${Territory}' to '${territoryName}' for site ${SiteID}`);
      }
      
      // Create site with PostGIS geometry using $executeRaw
      if (lon && lat) {
        await prisma.$executeRaw`
          INSERT INTO "Site" ("SiteID", "Name", "Type", "Province", "TerritoryID", "Location", "Elevation", "CreatedAt", "UpdatedAt")
          SELECT ${SiteID}, ${Name}, ${Type}::"SiteType", 'MAI NDOMBE', t."TerritoryID", ST_GeomFromText(CONCAT('POINT(', ${lon}, ' ', ${lat}, ')'), 4326), ${Elevation}, NOW(), NOW()
          FROM "Territory" t
          WHERE t."Name" = ${territoryName}
          ON CONFLICT ("SiteID") DO UPDATE SET
            "Name" = EXCLUDED."Name",
            "Type" = EXCLUDED."Type",
            "Province" = EXCLUDED."Province",
            "TerritoryID" = EXCLUDED."TerritoryID",
            "Location" = EXCLUDED."Location",
            "Elevation" = EXCLUDED."Elevation",
            "UpdatedAt" = NOW()
        `;
        
        console.log(`✓ Site created/updated with PostGIS: ${Name} (${SiteID}) in ${territoryName}`);
        createdCount++;
      } else {
        // Create site without location if coordinates are missing
        const createdSite = await prisma.site.upsert({
          where: { SiteID },
          update: {
            Name,
            Type,
            Province: 'MAI NDOMBE',
            Territory: { connect: { Name: territoryName } },
            Elevation: Elevation || null,
            UpdatedAt: new Date()
          },
          create: {
            SiteID,
            Name,
            Type,
            Province: 'MAI NDOMBE',
            Territory: { connect: { Name: territoryName } },
            Elevation: Elevation || null
          }
        });
        
        console.log(`✓ Site created/updated (no coordinates): ${Name} (${SiteID}) in ${territoryName}`);
        createdCount++;
      }
    } catch (error) {
      console.error(`✗ Error creating site ${site.SiteID}:`, error.message);
      errorCount++;
      // Continue with next site instead of throwing
    }
  }
  
  console.log(`\n=== SEEDING SUMMARY ===`);
  console.log(`✓ Sites created/updated: ${createdCount}`);
  console.log(`✗ Sites with errors: ${errorCount}`);
}

/**
 * Main seeding function that coordinates territory and site seeding
 * @param {Array} sites - Array of site objects
 * @returns {Promise<void>}
 */
async function seedDatabase(sites) {
  try {
    console.log('Starting database seeding...');
    
    // Step 1: Seed territories
    await seedTerritories();
    
    // Step 2: Seed sites
    await seedSites(sites);
    
    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main parser function that processes KML file and extracts site data
 * @param {string} kmlFilePath - Path to the KML file
 * @returns {Promise<Array>} - Promise resolving to array of site objects
 */
export async function parseKmlAndExtractSites(kmlFilePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(kmlFilePath)) {
      throw new Error(`KML file not found: ${kmlFilePath}`);
    }
    
    // Read KML file
    const kmlContent = fs.readFileSync(kmlFilePath, 'utf8');
    
    // Configure XML parser
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      parseNodeValue: true,
      parseTrueNumberOnly: false,
      arrayMode: false,
      trimValues: true
    };
    
    const parser = new XMLParser(options);
    const kmlData = parser.parse(kmlContent);
    
    // Navigate to Document and extract Placemarks
    let placemarks = [];
    
    // Handle different KML structures
    if (kmlData.kml?.Document?.Placemark) {
      placemarks = Array.isArray(kmlData.kml.Document.Placemark) 
        ? kmlData.kml.Document.Placemark 
        : [kmlData.kml.Document.Placemark];
    } else if (kmlData.kml?.Placemark) {
      placemarks = Array.isArray(kmlData.kml.Placemark) 
        ? kmlData.kml.Placemark 
        : [kmlData.kml.Placemark];
    } else if (kmlData.Document?.Placemark) {
      placemarks = Array.isArray(kmlData.Document.Placemark) 
        ? kmlData.Document.Placemark 
        : [kmlData.Document.Placemark];
    } else if (kmlData.Placemark) {
      placemarks = Array.isArray(kmlData.Placemark) 
        ? kmlData.Placemark 
        : [kmlData.Placemark];
    }
    
    console.log(`Found ${placemarks.length} placemarks in KML file`);
    
    // Process each placemark
    const sites = [];
    const processedNames = new Set(); // Track unique names to avoid duplicates
    
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      
      try {
        // Extract name
        const name = placemark.name || `Site ${i + 1}`;
        
        // Extract description
        const description = placemark.description || '';
        
        // Extract coordinates
        let coordinates = null;
        if (placemark.Point?.coordinates) {
          coordinates = placemark.Point.coordinates;
        } else if (placemark.Polygon?.outerBoundaryIs?.LinearRing?.coordinates) {
          coordinates = placemark.Polygon.outerBoundaryIs.LinearRing.coordinates;
        } else if (placemark.LineString?.coordinates) {
          coordinates = placemark.LineString.coordinates;
        }
        
        const { lon, lat, elev } = parseCoordinates(coordinates);
        
        // Extract type and territory from description
        const type = extractType(description);
        const territory = extractTerritory(description);
        
        // Generate unique Site ID
        let siteID = generateSiteID(name, territory, i);
        
        // Ensure uniqueness
        let counter = 1;
        const baseSiteID = siteID;
        while (processedNames.has(siteID)) {
          siteID = `${baseSiteID}_${counter}`;
          counter++;
        }
        processedNames.add(siteID);
        
        // Create site object
        const site = {
          SiteID: siteID,
          Name: name,
          Type: type || 'BATIMENT_ADMINISTRATIF', // Default type if not found
          Territory: territory || 'Unknown', // Default territory if not found
          Province: 'Unknown', // Will need to be mapped or extracted from other data
          Location: (lon && lat) ? `${lat},${lon}` : null, // Store as "lat,lng" string
          Elevation: elev,
          Coordinates: {
            longitude: lon,
            latitude: lat,
            elevation: elev
          },
          Description: description,
          OriginalIndex: i
        };
        
        sites.push(site);
        
        console.log(`Processed placemark ${i + 1}: ${name} -> ${siteID}`);
        
      } catch (error) {
        console.error(`Error processing placemark ${i + 1}:`, error.message);
        continue; // Skip this placemark and continue with others
      }
    }
    
    console.log(`Successfully parsed ${sites.length} sites from KML file`);
    
    return sites;
    
  } catch (error) {
    console.error('Error parsing KML file:', error.message);
    throw error;
  }
}

/**
 * Example usage function
 */
async function main() {
  try {
    // Check command line arguments
    const args = process.argv.slice(2);
    const kmlFilePath = args[0];
    const shouldSeed = args.includes('--seed') || args.includes('-s');
    
    if (!kmlFilePath) {
      console.log('Usage: node parseKmlAndSeed.js <path-to-kml-file> [--seed|-s]');
      console.log('Examples:');
      console.log('  node parseKmlAndSeed.js ./data/sites.kml           # Parse only');
      console.log('  node parseKmlAndSeed.js ./data/sites.kml --seed    # Parse and seed database');
      console.log('  node parseKmlAndSeed.js --seed-only                # Seed database with sample data');
      process.exit(1);
    }
    
    let sites = [];
    
    if (kmlFilePath === '--seed-only') {
      // Create sample sites for the four territories
      console.log('Creating sample sites for database seeding...');
      
      const sampleSites = [
        {
          SiteID: 'inongo-health-center-1',
          Name: 'Centre de Santé Inongo',
          Type: 'CENTRE_DE_SANTE',
          Territory: 'INONGO',
          Province: 'MAI NDOMBE',
          Coordinates: { longitude: 18.2667, latitude: -1.9333, elevation: 300 },
          Elevation: 300
        },
        {
          SiteID: 'kutu-primary-school-1',
          Name: 'École Primaire Kutu',
          Type: 'ECOLE_PRIMAIRE',
          Territory: 'KUTU',
          Province: 'MAI NDOMBE',
          Coordinates: { longitude: 18.1833, latitude: -2.3667, elevation: 320 },
          Elevation: 320
        },
        {
          SiteID: 'mushie-admin-building-1',
          Name: 'Bâtiment Administratif Mushie',
          Type: 'BATIMENT_ADMINISTRATIF',
          Territory: 'MUSHIE',
          Province: 'MAI NDOMBE',
          Coordinates: { longitude: 16.9222, latitude: -3.0167, elevation: 280 },
          Elevation: 280
        },
        {
          SiteID: 'yumbi-health-center-1',
          Name: 'Centre de Santé Yumbi',
          Type: 'CENTRE_DE_SANTE',
          Territory: 'YUMBI',
          Province: 'MAI NDOMBE',
          Coordinates: { longitude: 16.4333, latitude: -2.1333, elevation: 290 },
          Elevation: 290
        }
      ];
      
      sites = sampleSites;
      await seedDatabase(sites);
      return;
    }
    
    console.log(`Parsing KML file: ${kmlFilePath}`);
    
    sites = await parseKmlAndExtractSites(kmlFilePath);
    
    // Output results
    console.log('\n=== PARSING RESULTS ===');
    console.log(`Total sites extracted: ${sites.length}`);
    
    // Show summary by type
    const typeCounts = {};
    const territoryCounts = {};
    
    sites.forEach(site => {
      typeCounts[site.Type] = (typeCounts[site.Type] || 0) + 1;
      territoryCounts[site.Territory] = (territoryCounts[site.Territory] || 0) + 1;
    });
    
    console.log('\nSites by type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\nSites by territory:');
    Object.entries(territoryCounts).forEach(([territory, count]) => {
      console.log(`  ${territory}: ${count}`);
    });
    
    // Show first few sites as examples
    console.log('\nFirst 3 sites (example):');
    sites.slice(0, 3).forEach((site, index) => {
      console.log(`\n${index + 1}. ${site.Name} (${site.SiteID})`);
      console.log(`   Type: ${site.Type}`);
      console.log(`   Territory: ${site.Territory}`);
      console.log(`   Coordinates: ${site.Coordinates.latitude}, ${site.Coordinates.longitude}`);
      console.log(`   Elevation: ${site.Elevation || 'N/A'}`);
    });
    
    // Save to JSON file for inspection
    const outputPath = path.join(path.dirname(kmlFilePath), 'parsed_sites.json');
    fs.writeFileSync(outputPath, JSON.stringify(sites, null, 2));
    console.log(`\nResults saved to: ${outputPath}`);
    
    // Seed database if requested
    if (shouldSeed) {
      console.log('\n=== STARTING DATABASE SEEDING ===');
      await seedDatabase(sites);
    } else {
      console.log('\n💡 To seed the database, run with --seed flag');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || 
    import.meta.url.endsWith(process.argv[1]) ||
    process.argv[1].endsWith('parseKmlAndSeed.js')) {
  main();
}

// Export main functions
export { seedTerritories, seedSites, seedSitesWithPostGIS, seedDatabase };
export default parseKmlAndExtractSites;
