from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.db.models import Sum, Count
from django.utils import timezone
from .models import Proforma, ProformaItem
from .serializers import ProformaSerializer, ProformaCreateSerializer
from apps.invoices.models import Invoice, InvoiceItem
from apps.invoices.pdf_generator import generate_proforma_pdf


class ProformaViewSet(viewsets.ModelViewSet):
    queryset = Proforma.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['number', 'client__name']
    ordering_fields = ['date', 'number', 'total_ttc', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProformaCreateSerializer
        return ProformaSerializer
    
    def get_queryset(self):
        queryset = Proforma.objects.select_related('client', 'created_by').prefetch_related('items')
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def convert_to_invoice(self, request, pk=None):
        proforma = self.get_object()
        if proforma.status == 'converted':
            return Response({'error': 'Cette proforma a déjà été convertie'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create invoice from proforma
        invoice = Invoice.objects.create(
            client=proforma.client,
            created_by=request.user,
            date=timezone.now().date(),
            notes=f"Convertie depuis proforma {proforma.number}\n{proforma.notes}",
        )
        
        # Copy items
        for item in proforma.items.all():
            InvoiceItem.objects.create(
                invoice=invoice,
                product=item.product,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                tva_rate=item.tva_rate,
            )
        
        invoice.calculate_totals()
        proforma.status = 'converted'
        proforma.save()
        
        return Response({
            'message': 'Proforma convertie en facture',
            'invoice_number': invoice.number,
            'invoice_id': invoice.id
        })
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        proforma = self.get_object()
        pdf_content = generate_proforma_pdf(proforma)
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{proforma.number}.pdf"'
        return response
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = timezone.now()
        current_month = today.month
        current_year = today.year
        
        month_proformas = Proforma.objects.filter(
            date__year=current_year,
            date__month=current_month
        )
        
        stats = {
            'total_proformas_month': month_proformas.count(),
            'total_amount_month': month_proformas.aggregate(total=Sum('total_ttc'))['total'] or 0,
            'accepted': month_proformas.filter(status='accepted').count(),
            'pending': month_proformas.filter(status__in=['draft', 'sent']).count(),
            'converted': month_proformas.filter(status='converted').count(),
        }
        
        return Response(stats)
