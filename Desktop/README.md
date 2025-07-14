# KML Filtering and Styling Project

## Overview

This project focuses on filtering and creating a KML file for designated sites from the "Programme de Développement Local des 145 Territoires," specifically targeting the territories of Inongo, Kutu, Mushie, and Yumbi.

## Artifacts

- **Final Filtered KML File**: `pdl_145t_sites_corrected.kml`
- **Python Script for Filtering**: `generate_filtered_kml.py`
- **Python Script for Styling**: `create_styled_kml.py`

## Methodology

1. **Data Cleaning**: Each site name is standardized by removing extra spaces and converting to uppercase.
2. **Style Categorization**: Sites are categorized into three main styles based on their names:
   - Health centers (green pins)
   - Schools (blue pins)
   - Administrative buildings (red pins)
3. **Coordinate Mapping**: Coordinates are loaded from multiple CSV files, with manual entries for key sites.
4. **Script Execution**: Run `generate_filtered_kml.py` to filter data and `create_styled_kml.py` to generate a styled KML file.

## Data Sources

- `pdl_145t_analysis_workspace.csv`
- `master_sites_comprehensive.csv`
- `target_territories_sites.csv`

## Verification

- Ensure coordinates are accurate by cross-referencing site names with provided CSVs.
- Randomly verify a few entries manually with a map service.

## Usage

1. Run `generate_filtered_kml.py` to process and filter data from the sources.
2. Run `create_styled_kml.py` to generate the styled KML file.
3. Open the resulting `pdl_145t_sites_corrected.kml` in a KML viewer or GIS software for visualization.

## Notes

- Ensure all CSV files are up-to-date and located in the project directory.
- Adjust script paths as needed based on your directory structure.
