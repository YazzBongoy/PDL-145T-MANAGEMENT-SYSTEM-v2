#!/usr/bin/env python3
"""
Generate filtered KML file for the 65 sites in target territories (INONGO, KUTU, MUSHIE, YUMBI)
with proper styling, coordinates, and optional organization by territory folders.
"""

import pandas as pd
import csv
import re

def clean_site_name(name):
    """Clean site name for better matching"""
    if pd.isna(name):
        return name
    # Remove extra spaces and convert to uppercase
    return str(name).strip().upper()

def determine_style(site_name):
    """Determine the appropriate KML style based on site name"""
    if pd.isna(site_name):
        return "admin"
    
    name_upper = str(site_name).upper()
    if name_upper.startswith("CENTRE DE SANTE"):
        return "health"
    elif name_upper.endswith("ECOLE PRIMAIRE"):
        return "school"
    elif name_upper in ["INONGO", "KUTU", "MUSHIE", "YUMBI"]:
        return "admin"
    else:
        return "admin"

def determine_site_type_description(site_name):
    """Determine the site type description for the KML"""
    if pd.isna(site_name):
        return "BATIMENT ADMINISTRATIF"
    
    name_upper = str(site_name).upper()
    if name_upper.startswith("CENTRE DE SANTE"):
        return "CENTRE DE SANTE"
    elif name_upper.endswith("ECOLE PRIMAIRE"):
        return "ECOLE PRIMAIRE"
    elif name_upper in ["INONGO", "KUTU", "MUSHIE", "YUMBI"]:
        return "BATIMENT ADMINISTRATIF"
    else:
        return "BATIMENT ADMINISTRATIF"

def load_coordinates():
    """Load coordinate data from available sources"""
    coordinates = {}
    
    # Try to load from analysis workspace
    try:
        df = pd.read_csv('pdl_145t_analysis_workspace.csv')
        for _, row in df.iterrows():
            name = clean_site_name(row['name'])
            if pd.notna(row['lat']) and pd.notna(row['lon']):
                coordinates[name] = {
                    'lat': float(row['lat']),
                    'lon': float(row['lon'])
                }
    except Exception as e:
        print(f"Could not load analysis workspace: {e}")
    
    # Try to load from comprehensive master sites
    try:
        df = pd.read_csv('master_sites_comprehensive.csv')
        for _, row in df.iterrows():
            name = clean_site_name(row['name'])
            if pd.notna(row['latitude']) and pd.notna(row['longitude']):
                coordinates[name] = {
                    'lat': float(row['latitude']),
                    'lon': float(row['longitude'])
                }
    except Exception as e:
        print(f"Could not load master sites: {e}")
    
    # Manual coordinate entries for the specific sites we need
    # Based on the target territories and administrative centers
    manual_coords = {
        'INONGO': {'lat': -1.95784, 'lon': 18.17758},
        'KUTU': {'lat': -2.72884, 'lon': 18.14505},
        'MUSHIE': {'lat': -3.02343, 'lon': 16.92114},
        'YUMBI': {'lat': -1.90578, 'lon': 16.55431},
        'CENTRE DE SANTE NSELENGE': {'lat': -1.95726, 'lon': 18.17509},
    }
    
    # Add manual coordinates
    for name, coords in manual_coords.items():
        coordinates[name] = coords
    
    return coordinates

def get_approximate_coordinates(territory):
    """Get approximate coordinates for sites without exact coordinates"""
    # Administrative center coordinates for each territory
    territory_centers = {
        'INONGO': {'lat': -1.95784, 'lon': 18.17758},
        'KUTU': {'lat': -2.72884, 'lon': 18.14505},
        'MUSHIE': {'lat': -3.02343, 'lon': 16.92114},
        'YUMBI': {'lat': -1.90578, 'lon': 16.55431},
    }
    
    if territory in territory_centers:
        base_coords = territory_centers[territory]
        # Add small random offset to avoid overlapping markers
        import random
        offset = random.uniform(-0.01, 0.01)
        return {
            'lat': base_coords['lat'] + offset,
            'lon': base_coords['lon'] + offset
        }
    
    # Default to center of DRC
    return {'lat': -4.0, 'lon': 15.0}

def generate_kml():
    """Generate the filtered KML file"""
    
    # Load target territories sites
    try:
        target_sites = pd.read_csv('target_territories_sites.csv')
    except FileNotFoundError:
        print("Error: target_territories_sites.csv not found")
        return
    
    # Load coordinates
    coordinates = load_coordinates()
    
    # Start KML content
    kml_content = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>PDL-145T Sites - Inongo, Kutu, Mushie, Yumbi</name>
    <description>Filtered sites from Programme de Développement Local des 145 Territoires for target territories</description>
    
    <!-- Styles for different entity types -->
    <Style id="admin">
      <IconStyle>
        <color>ff0000ff</color>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="health">
      <IconStyle>
        <color>ff00ff00</color>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="school">
      <IconStyle>
        <color>ffff0000</color>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>

"""
    
    # Group sites by territory for folders
    territories = {}
    for _, row in target_sites.iterrows():
        territory = row['territory']
        if territory not in territories:
            territories[territory] = []
        territories[territory].append(row)
    
    # Generate placemarks organized by territory folders
    for territory, sites in territories.items():
        kml_content += f"""    <Folder>
      <name>{territory}</name>
      <description>Sites in {territory} territory</description>
      
"""
        
        for site in sites:
            site_name = site['site_name']
            clean_name = clean_site_name(site_name)
            
            # Get coordinates
            coords = None
            if clean_name in coordinates:
                coords = coordinates[clean_name]
            else:
                # Try partial matches
                for coord_name, coord_data in coordinates.items():
                    if clean_name and coord_name and (clean_name in coord_name or coord_name in clean_name):
                        coords = coord_data
                        break
            
            if coords is None:
                coords = get_approximate_coordinates(territory)
                print(f"Warning: Using approximate coordinates for {site_name}")
            
            # Determine style and type
            style = determine_style(site_name)
            type_desc = determine_site_type_description(site_name)
            
            # Create placemark
            kml_content += f"""      <Placemark>
        <name>{site_name}</name>
        <description>
          <![CDATA[
            <b>Type:</b> {type_desc}<br/>
            <b>Territory:</b> {territory}<br/>
            <b>Province:</b> MAI NDOMBE<br/>
            <b>Coordinates:</b> {coords['lat']}, {coords['lon']}
          ]]>
        </description>
        <styleUrl>#{style}</styleUrl>
        <Point>
          <coordinates>{coords['lon']},{coords['lat']},0</coordinates>
        </Point>
      </Placemark>
"""
        
        kml_content += "    </Folder>\n\n"
    
    # Close KML
    kml_content += """  </Document>
</kml>
"""
    
    # Write to file
    output_file = 'pdl_145t_inongo_kutu_mushie_yumbi.kml'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(kml_content)
    
    print(f"Generated KML file: {output_file}")
    
    # Count sites by type
    site_counts = {}
    total_sites = 0
    for _, row in target_sites.iterrows():
        style = determine_style(row['site_name'])
        site_counts[style] = site_counts.get(style, 0) + 1
        total_sites += 1
    
    print(f"\nSite summary:")
    print(f"  Administrative buildings (red): {site_counts.get('admin', 0)}")
    print(f"  Health centers (green): {site_counts.get('health', 0)}")
    print(f"  Schools (blue): {site_counts.get('school', 0)}")
    print(f"  Total sites: {total_sites}")
    
    # Territory breakdown
    print(f"\nTerritory breakdown:")
    for territory, sites in territories.items():
        print(f"  {territory}: {len(sites)} sites")

if __name__ == "__main__":
    generate_kml()
