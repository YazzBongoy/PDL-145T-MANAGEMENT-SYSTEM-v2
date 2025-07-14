#!/usr/bin/env python3
"""
Create a complete KML file with proper styling for all extracted sites from target territories.
Maps each site to appropriate style based on site type.
"""

import pandas as pd
import json

def determine_site_type(site_name):
    """Determine the site type based on the site name"""
    if site_name.startswith("CENTRE DE SANTE"):
        return "health"
    elif site_name.endswith("ECOLE PRIMAIRE"):
        return "school"
    elif site_name in ["INONGO", "KUTU", "MUSHIE", "YUMBI"]:
        return "admin"
    else:
        # Default to admin for any other cases
        return "admin"

def get_site_coordinates():
    """Get coordinates for sites from the existing master sites data"""
    
    # Read the master sites data
    try:
        df = pd.read_csv('master_sites_comprehensive.csv')
        
        # Create a mapping from site name to coordinates
        coords_map = {}
        for _, row in df.iterrows():
            site_name = row['name']
            if pd.notna(row['latitude']) and pd.notna(row['longitude']):
                coords_map[site_name] = {
                    'lat': float(row['latitude']),
                    'lon': float(row['longitude'])
                }
        
        return coords_map
    except FileNotFoundError:
        print("Master sites file not found. Using default coordinates.")
        return {}

def create_styled_kml():
    """Create a KML file with proper styling for all extracted sites"""
    
    # Read the extracted sites
    sites_df = pd.read_csv('target_territories_sites.csv')
    
    # Get coordinates mapping
    coords_map = get_site_coordinates()
    
    # KML header with styles
    kml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>PDL-145T Sites - Styled by Category (Inongo, Kutu, Mushie, Yumbi)</name>
    <description>Sites from Programme de Développement Local des 145 Territoires - Styled by site category</description>
    
    <!-- Style for administrative buildings (red pin) -->
    <Style id="admin">
      <IconStyle>
        <color>ff0000ff</color>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <!-- Style for health centers (green pin) -->
    <Style id="health">
      <IconStyle>
        <color>ff00ff00</color>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <!-- Style for schools (blue pin) -->
    <Style id="school">
      <IconStyle>
        <color>ffff0000</color>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>

'''
    
    # Process each site
    for _, row in sites_df.iterrows():
        territory = row['territory']
        site_name = row['site_name']
        
        # Determine site type and corresponding style
        site_type = determine_site_type(site_name)
        
        # Get coordinates
        if site_name in coords_map:
            coords = coords_map[site_name]
            lat = coords['lat']
            lon = coords['lon']
        else:
            # Default coordinates (center of DRC) if not found
            lat = -4.0
            lon = 15.0
            print(f"Warning: No coordinates found for {site_name}, using default")
        
        # Determine the type description
        if site_type == "admin":
            type_desc = "BATIMENT ADMINISTRATIF"
        elif site_type == "health":
            type_desc = "CENTRE DE SANTE"
        elif site_type == "school":
            type_desc = "ECOLE PRIMAIRE"
        else:
            type_desc = "UNKNOWN"
        
        # Create placemark
        placemark = f'''    <Placemark>
      <name>{site_name}</name>
      <description>
        <![CDATA[
          <b>Type:</b> {type_desc}<br/>
          <b>Territory:</b> {territory}<br/>
          <b>Province:</b> MAI NDOMBE<br/>
          <b>Coordinates:</b> {lat}, {lon}
        ]]>
      </description>
      <styleUrl>#{site_type}</styleUrl>
      <Point>
        <coordinates>{lon},{lat},0</coordinates>
      </Point>
    </Placemark>
'''
        
        kml_content += placemark
    
    # KML footer
    kml_content += '''  </Document>
</kml>
'''
    
    # Write to file
    output_file = 'pdl_145t_sites_styled.kml'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(kml_content)
    
    print(f"Created styled KML file: {output_file}")
    
    # Report on styling
    site_counts = {}
    for _, row in sites_df.iterrows():
        site_type = determine_site_type(row['site_name'])
        site_counts[site_type] = site_counts.get(site_type, 0) + 1
    
    print("\nSite styling summary:")
    print(f"  Administrative buildings (red pins): {site_counts.get('admin', 0)}")
    print(f"  Health centers (green pins): {site_counts.get('health', 0)}")
    print(f"  Schools (blue pins): {site_counts.get('school', 0)}")
    print(f"  Total sites: {sum(site_counts.values())}")

if __name__ == "__main__":
    create_styled_kml()
