import neo4j from 'neo4j-driver';
import { parseKmlAndExtractSites } from './parseKmlAndSeed.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Neo4j connection configuration
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

/**
 * Creates Neo4j driver instance
 * @returns {neo4j.Driver} Neo4j driver instance
 */
function createDriver() {
  return neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
}

/**
 * Creates uniqueness constraints on Territory.name and Site.siteId
 * @param {neo4j.Session} session - Neo4j session
 * @returns {Promise<void>}
 */
async function createConstraints(session) {
  console.log('Creating uniqueness constraints...');
  
  try {
    // Create constraint on Territory.name
    await session.run(`
      CREATE CONSTRAINT territory_name_unique IF NOT EXISTS
      FOR (t:Territory) REQUIRE t.name IS UNIQUE
    `);
    console.log('✓ Created uniqueness constraint on Territory.name');
    
    // Create constraint on Site.siteId
    await session.run(`
      CREATE CONSTRAINT site_id_unique IF NOT EXISTS
      FOR (s:Site) REQUIRE s.siteId IS UNIQUE
    `);
    console.log('✓ Created uniqueness constraint on Site.siteId');
    
  } catch (error) {
    console.error('Error creating constraints:', error.message);
    throw error;
  }
}

/**
 * Seeds Neo4j with territories
 * @param {neo4j.Session} session - Neo4j session
 * @returns {Promise<void>}
 */
async function seedTerritories(session) {
  const territories = ['INONGO', 'KUTU', 'MUSHIE', 'YUMBI'];
  
  console.log('Seeding territories...');
  
  for (const territoryName of territories) {
    try {
      const result = await session.run(`
        MERGE (t:Territory {name: $territory})
        RETURN t.name as name
      `, { territory: territoryName });
      
      console.log(`✓ Territory merged: ${territoryName}`);
    } catch (error) {
      console.error(`✗ Error merging territory ${territoryName}:`, error.message);
      throw error;
    }
  }
}

/**
 * Seeds Neo4j with sites and their relationships to territories
 * @param {neo4j.Session} session - Neo4j session
 * @param {Array} sites - Array of site objects from KML parsing
 * @returns {Promise<void>}
 */
async function seedSites(session, sites) {
  console.log(`Seeding ${sites.length} sites...`);
  
  let createdCount = 0;
  let errorCount = 0;
  
  const validTerritories = ['INONGO', 'KUTU', 'MUSHIE', 'YUMBI'];
  
  for (const site of sites) {
    try {
      const { SiteID, Name, Type, Territory, Coordinates, Elevation } = site;
      const { longitude: lon, latitude: lat } = Coordinates;
      
      // Map territory name (handling case variations and fallbacks)
      let territoryName = Territory?.toUpperCase();
      
      if (!validTerritories.includes(territoryName)) {
        // Try to match partially
        const matchedTerritory = validTerritories.find(t => 
          territoryName?.includes(t) || t.includes(territoryName || '')
        );
        territoryName = matchedTerritory || 'INONGO'; // Default fallback
        console.log(`⚠ Mapped territory '${Territory}' to '${territoryName}' for site ${SiteID}`);
      }
      
      // Use the Cypher query from the task specification
      const result = await session.run(`
        MERGE (t:Territory {name: $territory})
        MERGE (s:Site {siteId: $SiteID})
        SET s.name = $Name, 
            s.type = $Type, 
            s.longitude = $lon, 
            s.latitude = $lat, 
            s.elevation = $elev, 
            s.province = 'MAI NDOMBE'
        MERGE (s)-[:LOCATED_IN]->(t)
        RETURN s.siteId as siteId, s.name as name, t.name as territory
      `, {
        territory: territoryName,
        SiteID: SiteID,
        Name: Name || 'Unnamed Site',
        Type: Type || 'BATIMENT_ADMINISTRATIF',
        lon: lon || null,
        lat: lat || null,
        elev: Elevation || null
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
 * Seeds Neo4j with sample data for testing
 * @param {neo4j.Session} session - Neo4j session
 * @returns {Promise<void>}
 */
async function seedSampleSites(session) {
  console.log('Creating sample sites for Neo4j seeding...');
  
  const sampleSites = [
    {
      SiteID: 'inongo-health-center-1',
      Name: 'Centre de Santé Inongo',
      Type: 'CENTRE_DE_SANTE',
      Territory: 'INONGO',
      Coordinates: { longitude: 18.2667, latitude: -1.9333, elevation: 300 },
      Elevation: 300
    },
    {
      SiteID: 'kutu-primary-school-1',
      Name: 'École Primaire Kutu',
      Type: 'ECOLE_PRIMAIRE',
      Territory: 'KUTU',
      Coordinates: { longitude: 18.1833, latitude: -2.3667, elevation: 320 },
      Elevation: 320
    },
    {
      SiteID: 'mushie-admin-building-1',
      Name: 'Bâtiment Administratif Mushie',
      Type: 'BATIMENT_ADMINISTRATIF',
      Territory: 'MUSHIE',
      Coordinates: { longitude: 16.9222, latitude: -3.0167, elevation: 280 },
      Elevation: 280
    },
    {
      SiteID: 'yumbi-health-center-1',
      Name: 'Centre de Santé Yumbi',
      Type: 'CENTRE_DE_SANTE',
      Territory: 'YUMBI',
      Coordinates: { longitude: 16.4333, latitude: -2.1333, elevation: 290 },
      Elevation: 290
    }
  ];
  
  await seedSites(session, sampleSites);
}

/**
 * Verifies the seeded data by running some queries
 * @param {neo4j.Session} session - Neo4j session
 * @returns {Promise<void>}
 */
async function verifyData(session) {
  console.log('\n=== VERIFYING SEEDED DATA ===');
  
  try {
    // Count territories
    const territoryResult = await session.run('MATCH (t:Territory) RETURN count(t) as count');
    const territoryCount = territoryResult.records[0].get('count').toNumber();
    console.log(`✓ Total territories: ${territoryCount}`);
    
    // Count sites
    const siteResult = await session.run('MATCH (s:Site) RETURN count(s) as count');
    const siteCount = siteResult.records[0].get('count').toNumber();
    console.log(`✓ Total sites: ${siteCount}`);
    
    // Count relationships
    const relationshipResult = await session.run('MATCH ()-[:LOCATED_IN]->() RETURN count(*) as count');
    const relationshipCount = relationshipResult.records[0].get('count').toNumber();
    console.log(`✓ Total LOCATED_IN relationships: ${relationshipCount}`);
    
    // Show sites by territory
    const sitesPerTerritoryResult = await session.run(`
      MATCH (s:Site)-[:LOCATED_IN]->(t:Territory)
      RETURN t.name as territory, count(s) as siteCount
      ORDER BY t.name
    `);
    
    console.log('\nSites per territory:');
    for (const record of sitesPerTerritoryResult.records) {
      const territory = record.get('territory');
      const count = record.get('siteCount').toNumber();
      console.log(`  ${territory}: ${count} sites`);
    }
    
  } catch (error) {
    console.error('Error verifying data:', error.message);
    throw error;
  }
}

/**
 * Main seeding function that coordinates the entire process
 * @param {Array} sites - Array of site objects (optional, uses sample data if not provided)
 * @returns {Promise<void>}
 */
async function seedNeo4j(sites = null) {
  const driver = createDriver();
  const session = driver.session();
  
  try {
    console.log('Starting Neo4j database seeding...');
    console.log(`Connecting to: ${NEO4J_URI}`);
    
    // Step 1: Create uniqueness constraints
    await createConstraints(session);
    
    // Step 2: Seed territories
    await seedTerritories(session);
    
    // Step 3: Seed sites
    if (sites && sites.length > 0) {
      await seedSites(session, sites);
    } else {
      await seedSampleSites(session);
    }
    
    // Step 4: Verify the data
    await verifyData(session);
    
    console.log('\n🎉 Neo4j database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Neo4j database seeding failed:', error.message);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

/**
 * Clears all data from Neo4j (useful for testing)
 * @returns {Promise<void>}
 */
async function clearNeo4j() {
  const driver = createDriver();
  const session = driver.session();
  
  try {
    console.log('Clearing Neo4j database...');
    
    // Delete all nodes and relationships
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✓ All nodes and relationships deleted');
    
    // Drop constraints
    try {
      await session.run('DROP CONSTRAINT territory_name_unique IF EXISTS');
      await session.run('DROP CONSTRAINT site_id_unique IF EXISTS');
      console.log('✓ Constraints dropped');
    } catch (error) {
      console.log('Note: Some constraints may not have existed');
    }
    
    console.log('🧹 Neo4j database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Failed to clear Neo4j database:', error.message);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

/**
 * Main function for CLI usage
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === '--clear') {
      await clearNeo4j();
      return;
    }
    
    if (command === '--help' || command === '-h') {
      console.log('Usage: node seedNeo4j.js [options] [kml-file-path]');
      console.log('');
      console.log('Options:');
      console.log('  --clear                Clear all data from Neo4j');
      console.log('  --sample               Seed with sample data only');
      console.log('  --help, -h             Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  node seedNeo4j.js                          # Seed with sample data');
      console.log('  node seedNeo4j.js --sample                 # Seed with sample data');
      console.log('  node seedNeo4j.js path/to/sites.kml        # Parse KML and seed');
      console.log('  node seedNeo4j.js --clear                  # Clear all data');
      console.log('');
      console.log('Environment variables:');
      console.log('  NEO4J_URI      Neo4j connection URI (default: bolt://localhost:7687)');
      console.log('  NEO4J_USER     Neo4j username (default: neo4j)');
      console.log('  NEO4J_PASSWORD Neo4j password (default: password)');
      return;
    }
    
    let sites = null;
    
    if (command && command !== '--sample' && !command.startsWith('--')) {
      // Parse KML file
      console.log(`Parsing KML file: ${command}`);
      sites = await parseKmlAndExtractSites(command);
      console.log(`Parsed ${sites.length} sites from KML file`);
    }
    
    await seedNeo4j(sites);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions for use in other modules
export { seedNeo4j, clearNeo4j, createConstraints, seedTerritories, seedSites };
export default seedNeo4j;
