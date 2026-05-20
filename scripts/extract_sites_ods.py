from odf.opendocument import load
from odf.table import Table, TableRow, TableCell
from odf.text import P

doc = load('/home/ascatsarl/Documents/PDL-145T-MANAGEMENT-SYSTEM/TMUPDATED 2025- 10- 06- 15- 01- 00-1.ods')
sheets = doc.spreadsheet.getElementsByType(Table)

def get_cell_text(cell):
    texts = []
    for p in cell.getElementsByType(P):
        texts.append(str(p))
    return ' '.join(texts).strip()

# Afficher TOUTES les colonnes (A..L) du 1er site du PLANNING INONGO
# pour comprendre la structure rubriques/taches et pondérations
for sheet in sheets:
    sname = sheet.getAttribute('name')
    if sname != 'PLANNING INONGO TEP':
        continue

    print(f"=== {sname} — 1er site complet ===\n")
    print(f"  {'L':>3} | {'A':>3} | {'B':<45} | {'C':>12} | {'D':>12} | {'E':>8} | {'F':>6} | {'G':>6} | {'H':>6}")
    print(f"  {'-'*3}-+-{'-'*3}-+-{'-'*45}-+-{'-'*12}-+-{'-'*12}-+-{'-'*8}-+-{'-'*6}-+-{'-'*6}-+-{'-'*6}")

    rows = sheet.getElementsByType(TableRow)
    for i, row in enumerate(rows):
        if i > 105:  # 2 premiers sites environ
            break
        cells = row.getElementsByType(TableCell)
        def c(j): return get_cell_text(cells[j]) if j < len(cells) else ''
        a,b,cc,d,e,f,g,h = c(0),c(1),c(2),c(3),c(4),c(5),c(6),c(7)
        if any([a,b,cc,d,e,f,g,h]):
            print(f"  {i+1:3} | {a:>3} | {b:<45} | {cc:>12} | {d:>12} | {e:>8} | {f:>6} | {g:>6} | {h:>6}")






