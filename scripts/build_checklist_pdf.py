from pathlib import Path
from shutil import copyfile

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from build_checklist import CHECKS

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PDF = ROOT / "public" / "downloads" / "2026-gadget-buyers-checklist.pdf"
ROOT_PDF = ROOT / "2026 GADGET BUYER'S CHECKLIST.pdf"
TMP_PDF = ROOT / "tmp" / "checklist-render" / "2026-gadget-buyers-checklist.pdf"

NAVY = colors.HexColor("#18231D")
GREEN = colors.HexColor("#3D6552")
TERRACOTTA = colors.HexColor("#BD4B34")
INK = colors.HexColor("#25312B")
MUTED = colors.HexColor("#5F6C65")
PALE = colors.HexColor("#F3F0E9")

styles = getSampleStyleSheet()
body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.5, leading=14, textColor=INK, spaceAfter=7)
h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=GREEN, spaceBefore=12, spaceAfter=9)
question = ParagraphStyle("Question", parent=body, fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=NAVY, spaceAfter=2)
answer = ParagraphStyle("Answer", parent=body, leftIndent=22, firstLineIndent=0, spaceAfter=9)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(inch, 0.55 * inch, "NewGiftsAndGadgets.com | Research-based buying guidance")
    canvas.drawRightString(7.5 * inch, 0.55 * inch, f"Page {doc.page}")
    canvas.restoreState()


TMP_PDF.parent.mkdir(parents=True, exist_ok=True)
story = [
    Spacer(1, 0.9 * inch),
    Paragraph("EVERGREEN DECISION CHECKLIST", ParagraphStyle("Kicker", parent=body, alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=9.5, textColor=TERRACOTTA, spaceAfter=16)),
    Paragraph("The Gadget Buyer's Checklist", ParagraphStyle("Title", parent=styles["Title"], alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=28, leading=33, textColor=NAVY, spaceAfter=9)),
    Paragraph("10 practical checks before buying a tech product or gift", ParagraphStyle("Subtitle", parent=body, alignment=TA_CENTER, fontSize=14, leading=18, textColor=MUTED, spaceAfter=34)),
    Paragraph("Research-based guidance from NewGiftsAndGadgets.com", ParagraphStyle("Lead", parent=body, alignment=TA_CENTER, fontName="Helvetica-Bold", textColor=GREEN, spaceAfter=46)),
]

callout = Table([[Paragraph("<b>What this is:</b> a repeatable decision aid based on compatibility, ownership, risk, and retailer checks. It is not a claim that we personally tested every product.", body)]], colWidths=[6.5 * inch])
callout.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D8D3C7")), ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14), ("TOPPADDING", (0, 0), (-1, -1), 12), ("BOTTOMPADDING", (0, 0), (-1, -1), 12)]))
story += [callout, PageBreak(), Paragraph("How to use this checklist", h1), Paragraph("Work through all ten checks before checkout. A concern is not automatically a reason to reject a product; it is a reason to verify the detail or choose a safer alternative. Record sources and current retailer terms because products, software, prices, and policies change.", body)]

for index, (heading, text) in enumerate(CHECKS, 1):
    if index == 7:
        story.append(PageBreak())
    story.append(Paragraph(f"{index}. {heading}", question))
    story.append(Paragraph(text, answer))

story += [PageBreak(), Paragraph("Quick decision record", h1), Paragraph("Use this small record for expensive, connected, safety-sensitive, or difficult-to-return purchases.", body)]
rows = [[Paragraph("Check", question), Paragraph("Your notes", question)]]
for label, value in [
    ("Product and intended job", ""), ("Compatibility verified with", ""), ("Current seller and total price", ""),
    ("Return deadline and warranty route", ""), ("Subscription or recurring cost", ""),
    ("Main drawback or unresolved question", ""), ("Alternative considered", ""),
    ("Decision", "Buy / wait / choose another / skip"),
]:
    rows.append([Paragraph(label, body), Paragraph(value or "<br/><br/>", body)])
record = Table(rows, colWidths=[2.1 * inch, 4.4 * inch], repeatRows=1, hAlign="LEFT")
record.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), GREEN), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C9CEC9")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
story += [record, Spacer(1, 14), Paragraph("Before the final click", h1)]
for item in (
    "Confirm that the seller and product model are the ones you researched.",
    "Save the order confirmation, product listing, and return deadline.",
    "Recheck safety instructions and installation requirements before use.",
    "If an affiliate link is present, the site may earn a commission; the retailer controls the transaction and terms.",
):
    story.append(Paragraph(f"- {item}", ParagraphStyle("Bullet", parent=body, leftIndent=18, firstLineIndent=-10, spaceAfter=5)))
story += [Spacer(1, 12), Paragraph("Keep the checklist. Recheck the facts. Buy for fit, not hype.", ParagraphStyle("Close", parent=body, alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=12, textColor=TERRACOTTA))]

doc = SimpleDocTemplate(str(TMP_PDF), pagesize=letter, rightMargin=inch, leftMargin=inch, topMargin=0.75 * inch, bottomMargin=0.8 * inch, title="The Gadget Buyer's Checklist", author="NewGiftsAndGadgets Research Desk", subject="Evergreen research-based technology purchase checklist")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
PUBLIC_PDF.parent.mkdir(parents=True, exist_ok=True)
copyfile(TMP_PDF, PUBLIC_PDF)
copyfile(TMP_PDF, ROOT_PDF)
print(PUBLIC_PDF)
