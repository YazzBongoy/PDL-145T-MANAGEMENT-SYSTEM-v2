from odf.opendocument import load
from odf.table import Table, TableRow, TableCell
from odf.text import P
from odf.draw import Frame

doc = load('/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/TMUPDATED 2025- 10- 06- 15- 01- 00-1.ods')
sheets = doc.spreadsheet.getElementsByType(Table)

def get_cell_text(cell):
    texts = []
    for p in cell.getElementsByType(P):
        texts.append(str(p))
    return ' '.join(texts).strip()

# Focus sur INONGO: afficher les 55 premières lignes avec 10 colonnes
for sheet in sheets:
    sname = sheet.getAttribute('name')
    if sname != 'PLANNING INONGO TEP':
        continue

    print(f"=== {sname} — structure des colonnes ===\n")
    rows = sheet.getElementsByType(TableRow)
    for i, row in enumerate(rows[:55]):
        cells = row.getElementsByType(TableCell)
        ncols = min(12, len(cells))
        cols = [get_cell_text(cells[j])[:20] if j < len(cells) else '' for j in range(ncols)]
        if any(c.strip() for c in cols):
            print(f"  L{i+1:3} | " + " | ".join(f"{c:20}" for c in cols))





