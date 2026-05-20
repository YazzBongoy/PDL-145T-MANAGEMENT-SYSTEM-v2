from odf.opendocument import load
from odf.table import Table, TableRow, TableCell
from odf.text import P
import json

doc = load('/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/TMUPDATED 2025- 10- 06- 15- 01- 00-1.ods')
sheets = doc.spreadsheet.getElementsByType(Table)

def get_cell_text(cell):
    texts = []
    for p in cell.getElementsByType(P):
        texts.append(str(p))
    return ' '.join(texts).strip()

# Territory name mapping from sheet name
TERRITORY_MAP = {
    'INONGO_TP_DONE': "Territoire d'Inongo",
    'KUTU_TP_DONE':   'Territoire de Kutu',
    'MUSHI_TP_DONE':  'Territoire de Mushie',
    'YUMBI_TP_DONE':  "Territoire d'Yumbi",
}

all_sites = {}

for sheet in sheets:
    sname = sheet.getAttribute('name')
    if sname not in TERRITORY_MAP:
        continue

    territory = TERRITORY_MAP[sname]
    rows = sheet.getElementsByType(TableRow)
    sites = []

    for row in rows:
        cells = row.getElementsByType(TableCell)
        col_a = get_cell_text(cells[0]) if len(cells) > 0 else ''
        col_b = get_cell_text(cells[1]) if len(cells) > 1 else ''

        # A site row has a number in col A and a site name in col B
        if col_b and col_a.strip().isdigit():
            sites.append(col_b.strip())

    all_sites[territory] = sites
    print(f"[{sname}] {territory} — {len(sites)} sites:")
    for i, s in enumerate(sites, 1):
        print(f"  {i:2}. {s}")
    print()

total = sum(len(v) for v in all_sites.values())
print(f"=== TOTAL: {total} sites ===")

# Save to JSON for use in seed script
with open('/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/scripts/sites_from_ods.json', 'w', encoding='utf-8') as f:
    json.dump(all_sites, f, ensure_ascii=False, indent=2)
print("→ Sauvegardé dans scripts/sites_from_ods.json")



