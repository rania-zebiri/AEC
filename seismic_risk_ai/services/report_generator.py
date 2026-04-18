import os
from fpdf import FPDF

class ReportGenerator:
    def __init__(self, output_dir="data"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def generate_pdf(self, data, filename="monthly_report.pdf"):
        try:
            pdf = FPDF()
            pdf.add_page()
            
            # Header - Dark Background style
            pdf.set_fill_color(11, 14, 20) # Dashboard background color
            pdf.rect(0, 0, 210, 297, 'F')
            
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Arial", 'B', 24)
            pdf.cell(0, 20, "Exposure Report", ln=True)
            
            pdf.set_font("Arial", size=10)
            pdf.set_text_color(139, 148, 158)
            pdf.cell(0, 10, "Generated automatically on 18/04/2026", ln=True)
            
            # Executive Summary Box
            pdf.ln(10)
            pdf.set_fill_color(22, 27, 34)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 10, "  EXECUTIVE SUMMARY", ln=True, fill=True)
            
            pdf.set_font("Arial", size=11)
            pdf.multi_cell(0, 10, f"  {data['summary']}", fill=True)
            
            # Indicators Table
            pdf.ln(20)
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 10, "KEY INDICATORS", ln=True)
            
            # Table Header
            pdf.set_font("Arial", 'B', 10)
            pdf.set_text_color(139, 148, 158)
            pdf.cell(80, 10, " INDICATOR", border='B')
            pdf.cell(60, 10, " VALUE", border='B')
            pdf.cell(40, 10, " CHANGE", border='B', ln=True)
            
            # Table Rows
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Arial", size=10)
            for item in data.get('indicators', []):
                pdf.cell(80, 12, f" {item['name']}", border='B')
                pdf.cell(60, 12, f" {item['curr']}", border='B')
                pdf.set_text_color(35, 134, 54) # Green for change
                pdf.cell(40, 12, f" {item.get('change', '+0')}", border='B', ln=True)
                pdf.set_text_color(255, 255, 255)

            path = os.path.join(self.output_dir, filename)
            pdf.output(path)
            return path
        except Exception as e:
            print(f"Error generating PDF: {e}")
            return None