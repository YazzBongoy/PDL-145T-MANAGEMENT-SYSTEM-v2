import openpyxl

# Read the Excel file
wb = openpyxl.load_workbook('acte_final_with_rubriques_PDL145T_65_sites.xlsx')
ws = wb.active

# Headers are in row 3 (index 2)
description_col = 1  # "Description de matériaux"
unit_col = 2  # "Unité"

materials_manufactured = set()
materials_local = set()
equipment = set()

# Start from row 6 (index 5) where data begins
for row in ws.iter_rows(min_row=6, values_only=True):
    if len(row) > max(description_col, unit_col):
        description = row[description_col]
        unit = row[unit_col]
        
        if description:
            description_str = str(description).strip()
            
            # Skip subtotals, totals, fees, and empty entries
            if any(keyword in description_str.lower() for keyword in ['sous total', 'total', 'frais', 'montant', 'autre', 'rubrique', 'matériaux', 'équipement', 'section', 'menuiserie', 'plomberie']):
                continue
            
            # Skip if description is just a number or very short
            if len(description_str) < 3 or description_str.replace('.', '').replace(',', '').isdigit():
                continue
            
            # Check if it's equipment
            equipment_keywords = ['bétonnière', 'vibrateur', 'niveau', 'dame', 'pelle', 'pioche', 'truelle', 'scie', 'marteau', 'échelle', 'meuleuse', 'taloche', 'rouleau', 'coffrage', 'poste à souder', 'grue', 'camion', 'engin', 'compresseur', 'mixeur']
            
            is_equipment = any(keyword in description_str.lower() for keyword in equipment_keywords)
            
            # Check if it's local material
            local_keywords = ['main d\'œuvre', 'gazons', 'sable', 'gravier', 'eau', 'remblais', 'bois', 'pierre', 'moellon', 'bloc']
            is_local = any(keyword in description_str.lower() for keyword in local_keywords)
            
            # Format: "Description (Unit)"
            if unit:
                entry = f"{description_str} ({unit})"
            else:
                entry = description_str
            
            if is_equipment:
                equipment.add(entry)
            elif is_local:
                materials_local.add(entry)
            else:
                materials_manufactured.add(entry)

# Save to file
with open('materials_extracted.txt', 'w', encoding='utf-8') as f:
    f.write("=== MATÉRIAUX MANUFACTURÉS ===\n")
    for material in sorted(materials_manufactured):
        f.write(f"- {material}\n")
    f.write(f"\nTotal matériaux manufacturés: {len(materials_manufactured)}\n\n")
    
    f.write("=== MATÉRIAUX LOCAUX ===\n")
    for material in sorted(materials_local):
        f.write(f"- {material}\n")
    f.write(f"\nTotal matériaux locaux: {len(materials_local)}\n\n")
    
    f.write("=== ÉQUIPEMENTS ===\n")
    for equip in sorted(equipment):
        f.write(f"- {equip}\n")
    f.write(f"\nTotal équipements: {len(equipment)}\n")

print("=== MATÉRIAUX MANUFACTURÉS ===")
for material in sorted(materials_manufactured):
    print(f"- {material}")

print(f"\nTotal matériaux manufacturés: {len(materials_manufactured)}")

print("\n=== MATÉRIAUX LOCAUX ===")
for material in sorted(materials_local):
    print(f"- {material}")

print(f"\nTotal matériaux locaux: {len(materials_local)}")

print("\n=== ÉQUIPEMENTS ===")
for equip in sorted(equipment):
    print(f"- {equip}")

print(f"\nTotal équipements: {len(equipment)}")

print("\n✅ Extraction saved to materials_extracted.txt")

