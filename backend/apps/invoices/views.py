from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.db.models import Sum, Count
from django.utils import timezone
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer, InvoiceCreateSerializer, InvoiceItemSerializer
from .pdf_generator import generate_invoice_pdf


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['number', 'client__name']
    ordering_fields = ['date', 'number', 'total_ttc', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        queryset = Invoice.objects.select_related('client', 'created_by').prefetch_related('items')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by client
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status != 'draft':
            return Response({'error': 'Seules les factures en brouillon peuvent être finalisées'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        invoice.status = 'finalized'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status not in ['finalized', 'draft']:
            return Response({'error': 'Cette facture ne peut pas être marquée comme payée'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        invoice.status = 'paid'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        pdf_content = generate_invoice_pdf(invoice)
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{invoice.number}.pdf"'
        return response
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        today = timezone.now()
        current_month = today.month
        current_year = today.year
        
        # Stats du mois
        month_invoices = Invoice.objects.filter(
            date__year=current_year,
            date__month=current_month
        )
        
        stats = {
            'total_invoices_month': month_invoices.count(),
            'total_amount_month': month_invoices.aggregate(total=Sum('total_ttc'))['total'] or 0,
            'paid_invoices': month_invoices.filter(status='paid').count(),
            'pending_invoices': month_invoices.filter(status__in=['draft', 'finalized']).count(),
            'paid_amount': month_invoices.filter(status='paid').aggregate(total=Sum('total_ttc'))['total'] or 0,
        }
        
        return Response(stats)
