from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "2026 GADGET BUYER.docx"

NAVY = "18231D"
GREEN = "3D6552"
TERRACOTTA = "BD4B34"
INK = "25312B"
MUTED = "5F6C65"
PALE = "F3F0E9"
WHITE = "FFFFFF"

CHECKS = [
    ("Name the job", "Write one sentence describing the recurring problem or occasion. If the item does not address that sentence, stop and reconsider."),
    ("Check recipient fit", "Confirm who will use it, where it will live, how often it is likely to be used, and whether the recipient actually wants this type of product."),
    ("Verify compatibility", "Check dimensions, ports, operating systems, power, wireless standards, mounting limits, required accounts, and employer or landlord restrictions."),
    ("Calculate total ownership cost", "Add required accessories, subscriptions, consumables, replacement parts, shipping, tax, maintenance, and likely energy use to the purchase price."),
    ("Read the current retailer terms", "Verify the seller, stock status, delivery estimate, return window, return shipping, restocking fees, warranty route, and final price immediately before ordering."),
    ("Separate specifications from outcomes", "Treat manufacturer and retailer claims as published information, not independent proof. Look for measurements, manuals, certifications, and clearly described test methods."),
    ("Look for complaint patterns", "Recent owner feedback can reveal recurring fit, reliability, app, or support problems. Check several sources and distinguish repeated details from isolated stories or suspicious review activity."),
    ("Review privacy, safety, and accessibility", "For connected, powered, wearable, health-related, child, pet, vehicle, or security products, review permissions, data practices, safety instructions, legal limits, and user accessibility needs."),
    ("Plan for support and end of life", "Check update policy, replacement parts, repair options, battery replacement, consumable availability, customer-support channels, and what happens if an app or cloud service ends."),
    ("Compare and pause", "Compare at least one alternative and the option to buy nothing. For a discretionary purchase, leave time between research and checkout so urgency or advertising does not make the decision for you."),
]


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths):
    total = sum(widths)
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    tbl_w.set(qn("w:w"), str(total))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = OxmlElement("w:tblInd")
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")
    tbl_pr.append(tbl_ind)
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for cell, width in zip(row.cells, widths):
            tc_w = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)


def set_font(run, size=None, bold=None, color=INK):
    run.font.name = "Calibri"
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:ascii"), "Calibri")
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:hAnsi"), "Calibri")
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Page ")
    set_font(run, 9, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    paragraph._p.append(fld)


doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(1)
section.bottom_margin = Inches(1)
section.left_margin = Inches(1)
section.right_margin = Inches(1)
section.header_distance = Inches(0.492)
section.footer_distance = Inches(0.492)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(11)
normal.font.color.rgb = RGBColor.from_string(INK)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.25

for name, size, color, before, after in (
    ("Title", 30, NAVY, 0, 8),
    ("Subtitle", 14, MUTED, 0, 24),
    ("Heading 1", 16, GREEN, 18, 10),
    ("Heading 2", 13, GREEN, 14, 7),
    ("Heading 3", 12, NAVY, 10, 5),
):
    style = styles[name]
    style.font.name = "Calibri"
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor.from_string(color)
    style.font.bold = name != "Subtitle"
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)

list_style = styles["List Number"]
list_style.font.name = "Calibri"
list_style.font.size = Pt(11)
list_style.paragraph_format.left_indent = Inches(0.375)
list_style.paragraph_format.first_line_indent = Inches(-0.188)
list_style.paragraph_format.space_after = Pt(8)
list_style.paragraph_format.line_spacing = 1.25

header = section.header.paragraphs[0]
header.text = "NEWGIFTSANDGADGETS.COM  |  BUYING GUIDE"
header.alignment = WD_ALIGN_PARAGRAPH.CENTER
for run in header.runs:
    set_font(run, 8.5, True, MUTED)
footer = section.footer.paragraphs[0]
add_page_number(footer)

for _ in range(3):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(24)

kicker = doc.add_paragraph()
kicker.alignment = WD_ALIGN_PARAGRAPH.CENTER
kicker.paragraph_format.space_after = Pt(18)
set_font(kicker.add_run("EVERGREEN DECISION CHECKLIST"), 10, True, TERRACOTTA)

title = doc.add_paragraph(style="Title")
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.add_run("The Gadget Buyer's Checklist")
subtitle = doc.add_paragraph(style="Subtitle")
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.add_run("10 practical checks before buying a tech product or gift")

lead = doc.add_paragraph()
lead.alignment = WD_ALIGN_PARAGRAPH.CENTER
lead.paragraph_format.space_before = Pt(22)
lead.paragraph_format.space_after = Pt(42)
set_font(lead.add_run("Research-based guidance from NewGiftsAndGadgets.com"), 11, True, GREEN)

p = doc.add_paragraph()
p.paragraph_format.left_indent = Inches(0.15)
p.paragraph_format.right_indent = Inches(0.15)
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after = Pt(10)
p_pr = p._p.get_or_add_pPr()
p_shd = OxmlElement("w:shd")
p_shd.set(qn("w:fill"), PALE)
p_pr.append(p_shd)
set_font(p.add_run("What this is: "), 10.5, True, NAVY)
set_font(p.add_run("a repeatable decision aid based on compatibility, ownership, risk, and retailer checks. It is not a claim that we personally tested every product."), 10.5)

doc.add_page_break()
doc.add_heading("How to use this checklist", level=1)
doc.add_paragraph("Work through all ten checks before checkout. A concern is not automatically a reason to reject a product; it is a reason to verify the detail or choose a safer alternative. Record sources and current retailer terms because products, software, prices, and policies change.")

for heading, body in CHECKS:
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.keep_together = True
    p.paragraph_format.keep_with_next = True
    set_font(p.add_run(f"{heading}. "), 11, True, NAVY)
    set_font(p.add_run(body), 11)

doc.add_heading("Quick decision record", level=1)
doc.add_paragraph("Use this small record for expensive, connected, safety-sensitive, or difficult-to-return purchases.")
table = doc.add_table(rows=1, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = "Table Grid"
rows = [
    ("Product and intended job", ""),
    ("Compatibility verified with", ""),
    ("Current seller and total price", ""),
    ("Return deadline and warranty route", ""),
    ("Subscription or recurring cost", ""),
    ("Main drawback or unresolved question", ""),
    ("Alternative considered", ""),
    ("Decision", "Buy / wait / choose another / skip"),
]
for label, value in rows:
    cells = table.add_row().cells
    cells[0].text = label
    cells[1].text = value
set_table_geometry(table, [3000, 6360])
for cell in table.rows[0].cells:
    shade(cell, GREEN)
header_tr_pr = table.rows[0]._tr.get_or_add_trPr()
header_flag = OxmlElement("w:tblHeader")
header_flag.set(qn("w:val"), "true")
header_tr_pr.append(header_flag)
table.cell(0, 0).text = "Check"
table.cell(0, 1).text = "Your notes"
for cell in table.rows[0].cells:
    for run in cell.paragraphs[0].runs:
        set_font(run, 10, True, WHITE)
for row in table.rows[1:]:
    row.cells[0].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    row.cells[1].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for run in row.cells[0].paragraphs[0].runs:
        set_font(run, 10, True, NAVY)
    for run in row.cells[1].paragraphs[0].runs:
        set_font(run, 10)

doc.add_heading("Before the final click", level=1)
for text in (
    "Confirm that the seller and product model are the ones you researched.",
    "Save the order confirmation, product listing, and return deadline.",
    "Recheck safety instructions and installation requirements before use.",
    "If an affiliate link is present, the site may earn a commission; the retailer controls the transaction and terms.",
):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.375)
    p.paragraph_format.first_line_indent = Inches(-0.188)
    p.paragraph_format.space_after = Pt(5)
    set_font(p.add_run(text), 11)

closing = doc.add_paragraph()
closing.paragraph_format.space_before = Pt(16)
closing.paragraph_format.space_after = Pt(0)
closing.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_font(closing.add_run("Keep the checklist. Recheck the facts. Buy for fit, not hype."), 12, True, TERRACOTTA)

doc.core_properties.title = "The Gadget Buyer's Checklist"
doc.core_properties.subject = "Evergreen research-based technology purchase checklist"
doc.core_properties.author = "NewGiftsAndGadgets Research Desk"
doc.core_properties.keywords = "gadget checklist, technology buying guide, gift buying"
doc.save(OUTPUT)
print(OUTPUT)
