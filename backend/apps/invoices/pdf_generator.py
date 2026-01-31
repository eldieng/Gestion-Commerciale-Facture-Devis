from django.template.loader import render_to_string
from django.conf import settings
from xhtml2pdf import pisa
from pathlib import Path
from io import BytesIO
import base64


def get_logo_base64():
    # Chercher d'abord le nouveau logo PNG
    logo_path = Path(settings.BASE_DIR).parent / 'img' / 'logo_moultazam.png'
    if logo_path.exists():
        with open(logo_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8'), 'png'
    # Fallback sur l'ancien logo
    logo_path = Path(settings.BASE_DIR).parent / 'img' / '_logo.jpg'
    if logo_path.exists():
        with open(logo_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8'), 'jpeg'
    return None, None


def render_pdf(html_content):
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html_content.encode('utf-8')), result)
    if not pdf.err:
        return result.getvalue()
    return None


def get_company_context():
    return {
        'name': settings.COMPANY_NAME,
        'slogan': getattr(settings, 'COMPANY_SLOGAN', 'Distribution & Fournitures Industrielles'),
        'type': getattr(settings, 'COMPANY_TYPE', 'Entreprise Individuelle'),
        'address': settings.COMPANY_ADDRESS,
        'phone': settings.COMPANY_PHONE,
        'phone2': getattr(settings, 'COMPANY_PHONE2', ''),
        'email': settings.COMPANY_EMAIL,
        'ninea': settings.COMPANY_NINEA,
        'rccm': getattr(settings, 'COMPANY_RCCM', ''),
    }


def generate_invoice_pdf(invoice):
    logo_base64, logo_type = get_logo_base64()
    
    context = {
        'invoice': invoice,
        'items': invoice.items.all(),
        'company': get_company_context(),
        'logo_base64': logo_base64,
        'logo_type': logo_type,
    }
    
    html_content = render_to_string('invoices/invoice_pdf.html', context)
    return render_pdf(html_content)


def generate_proforma_pdf(proforma):
    logo_base64, logo_type = get_logo_base64()
    
    context = {
        'proforma': proforma,
        'items': proforma.items.all(),
        'company': get_company_context(),
        'logo_base64': logo_base64,
        'logo_type': logo_type,
    }
    
    html_content = render_to_string('proformas/proforma_pdf.html', context)
    return render_pdf(html_content)


def generate_delivery_note_pdf(delivery_note):
    logo_base64, logo_type = get_logo_base64()
    
    context = {
        'delivery_note': delivery_note,
        'items': delivery_note.items.all(),
        'company': get_company_context(),
        'logo_base64': logo_base64,
        'logo_type': logo_type,
    }
    
    html_content = render_to_string('delivery_notes/delivery_note_pdf.html', context)
    return render_pdf(html_content)
