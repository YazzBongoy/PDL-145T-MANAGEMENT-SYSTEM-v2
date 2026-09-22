# Neo4j Seeding Script

This script seeds a Neo4j database with Territory and Site nodes along with their relationships, based on the existing KML parsing functionality.

## Features

- Creates uniqueness constraints on `Territory.name` and `Site.siteId`
- Seeds Territory nodes for: INONGO, KUTU, MUSHIE, YUMBI
- Seeds Site nodes with properties: siteId, name, type, longitude, latitude, elevation, province
- Creates `LOCATED_IN` relationships between Sites and Territories
- Uses the exact Cypher query specification from the task
- Supports both KML file parsing and sample data seeding
- Includes data verification and summary reporting

## Prerequisites

1. **Neo4j Database**: Ensure Neo4j is running locally or have access to a Neo4j instance
2. **Dependencies**: The `neo4j-driver` package is installed (automatically installed via npm)

## Configuration

Set up your Neo4j connection in the `.env` file:

```bash
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password
```

## Usage

### Basic Usage (Sample Data)

```bash
# Seed with sample data (4 sites, one per territory)
node scripts/seedNeo4j.js

# or explicitly
node scripts/seedNeo4j.js --sample
```

### Parse KML and Seed

```bash
# Parse a KML file and seed the database
node scripts/seedNeo4j.js path/to/your/sites.kml
```

### Clear Database

```bash
# Clear all nodes, relationships, and constraints
node scripts/seedNeo4j.js --clear
```

### Help

```bash
# Show help information
node scripts/seedNeo4j.js --help
```

## Cypher Query Used

The script implements the exact Cypher query specified in the task:

```cypher
MERGE (t:Territory {name:$territory})
MERGE (s:Site {siteId:$SiteID})
SET s.name=$Name, s.type=$Type, s.longitude=$lon, s.latitude=$lat, s.elevation=$elev, s.province='MAI NDOMBE'
MERGE (s)-[:LOCATED_IN]->(t);
```

## Constraints Created

The script automatically creates these uniqueness constraints:

```cypher
CREATE CONSTRAINT territory_name_unique IF NOT EXISTS
FOR (t:Territory) REQUIRE t.name IS UNIQUE

CREATE CONSTRAINT site_id_unique IF NOT EXISTS
FOR (s:Site) REQUIRE s.siteId IS UNIQUE
```

## Data Structure

### Territory Node
- `name`: Territory name (INONGO, KUTU, MUSHIE, YUMBI)

### Site Node
- `siteId`: Unique site identifier
- `name`: Site name
- `type`: Site type (CENTRE_DE_SANTE, ECOLE_PRIMAIRE, BATIMENT_ADMINISTRATIF)
- `longitude`: Geographic longitude
- `latitude`: Geographic latitude
- `elevation`: Elevation in meters
- `province`: Always set to 'MAI NDOMBE'

### Relationship
- `LOCATED_IN`: Connects Site to Territory

## Sample Output

```
Starting Neo4j database seeding...
Connecting to: bolt://localhost:7687
Creating uniqueness constraints...
✓ Created uniqueness constraint on Territory.name
✓ Created uniqueness constraint on Site.siteId
Seeding territories...
✓ Territory merged: INONGO
✓ Territory merged: KUTU
✓ Territory merged: MUSHIE
✓ Territory merged: YUMBI
Creating sample sites for Neo4j seeding...
Seeding 4 sites...
✓ Site created/updated: Centre de Santé Inongo (inongo-health-center-1) in INONGO
✓ Site created/updated: École Primaire Kutu (kutu-primary-school-1) in KUTU
✓ Site created/updated: Bâtiment Administratif Mushie (mushie-admin-building-1) in MUSHIE
✓ Site created/updated: Centre de Santé Yumbi (yumbi-health-center-1) in YUMBI

=== SEEDING SUMMARY ===
✓ Sites created/updated: 4
✗ Sites with errors: 0

=== VERIFYING SEEDED DATA ===
✓ Total territories: 4
✓ Total sites: 4
✓ Total LOCATED_IN relationships: 4

Sites per territory:
  INONGO: 1 sites
  KUTU: 1 sites
  MUSHIE: 1 sites
  YUMBI: 1 sites

🎉 Neo4j database seeding completed successfully!
```

## Integration with Existing KML Parser

The script integrates with the existing `parseKmlAndSeed.js` script to:
1. Parse KML files using the same extraction logic
2. Map territories to the four valid territories
3. Handle coordinate parsing and site type extraction
4. Generate unique site IDs

## Error Handling

- Connection errors are caught and reported
- Individual site seeding errors don't stop the entire process
- Territory mapping handles case variations and provides fallbacks
- Constraint creation uses `IF NOT EXISTS` to avoid conflicts

## Functions Exported

- `seedNeo4j(sites)`: Main seeding function
- `clearNeo4j()`: Clears all data
- `createConstraints(session)`: Creates uniqueness constraints
- `seedTerritories(session)`: Seeds territory nodes
- `seedSites(session, sites)`: Seeds site nodes and relationships

## Verification Queries

After seeding, you can verify the data in Neo4j browser with:

```cypher
// Count all nodes
MATCH (n) RETURN labels(n) as nodeType, count(n) as count

// Show all sites with their territories
MATCH (s:Site)-[:LOCATED_IN]->(t:Territory)
RETURN s.name, s.type, t.name
ORDER BY t.name, s.name

// Show sites by territory with coordinates
MATCH (s:Site)-[:LOCATED_IN]->(t:Territory)
WHERE s.longitude IS NOT NULL AND s.latitude IS NOT NULL
RETURN t.name, s.name, s.longitude, s.latitude, s.elevation
```
