import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(import.meta.dirname, '..', '.env') });

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j', 
    process.env.NEO4J_PASSWORD || 'password'
  )
);

async function validateNeo4jData() {
  const session = driver.session();
  
  try {
    console.log('=== NEO4J DATA VALIDATION ===\n');
    
    // Query: Sites grouped by territory
    const result = await session.run(`
      MATCH (t:Territory)<-[:LOCATED_IN]-(s:Site) 
      RETURN t.name as territoryName, count(s) as siteCount
      ORDER BY t.name
    `);
    
    console.log('Sites by Territory in Neo4j:');
    let totalSites = 0;
    const expectedCounts = {
      'INONGO': 15,
      'KUTU': 13, 
      'MUSHIE': 20,
      'YUMBI': 17
    };
    
    for (const record of result.records) {
      const territoryName = record.get('territoryName');
      const siteCount = record.get('siteCount').toNumber();
      const expected = expectedCounts[territoryName] || 'unknown';
      const isMatch = expected === siteCount;
      totalSites += siteCount;
      
      console.log(`  ${territoryName}: ${siteCount} (expected: ${expected}) ${isMatch ? '✓' : '✗'}`);
    }
    
    console.log(`\nTotal sites in Neo4j: ${totalSites}`);
    console.log(`Expected total: 65 ${totalSites === 65 ? '✓' : '✗'}`);
    
    // Check for any sites without territory relationships
    const orphanSitesResult = await session.run(`
      MATCH (s:Site)
      WHERE NOT (s)-[:LOCATED_IN]->(:Territory)
      RETURN count(s) as orphanCount
    `);
    
    const orphanCount = orphanSitesResult.records[0].get('orphanCount').toNumber();
    console.log(`Sites without territory relationship: ${orphanCount}`);
    
    console.log('\n=== NEO4J VALIDATION SUMMARY ===');
    const allMatch = totalSites === 65 && 
                    result.records.every(record => {
                      const territoryName = record.get('territoryName');
                      const siteCount = record.get('siteCount').toNumber();
                      return expectedCounts[territoryName] === siteCount;
                    });
    
    console.log(`Total sites: ${totalSites}/65 ${totalSites === 65 ? '✓' : '✗'}`);
    console.log(`Territory distribution: ${allMatch ? '✓' : '✗'}`);
    console.log(`Orphaned sites: ${orphanCount}`);
    
    if (allMatch && orphanCount === 0) {
      console.log('\n🎉 Neo4j validation passed!');
    } else {
      console.log('\n⚠️  Neo4j validation issues detected.');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Neo4j:', error.message);
    console.log('\n💡 Make sure Neo4j is running and credentials are correct.');
    console.log('   Neo4j URI:', process.env.NEO4J_URI || 'bolt://localhost:7687');
    console.log('   Neo4j User:', process.env.NEO4J_USER || 'neo4j');
  } finally {
    await session.close();
  }
}

// Run the validation
validateNeo4jData()
  .then(() => driver.close())
  .catch(console.error);
