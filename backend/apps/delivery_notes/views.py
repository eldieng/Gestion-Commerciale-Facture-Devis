from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .models import DeliveryNote, DeliveryNoteItem
from .serializers import DeliveryNoteSerializer, DeliveryNoteCreateSerializer
from apps.invoices.pdf_generator import generate_delivery_note_pdf


class DeliveryNoteViewSet(viewsets.ModelViewSet):
    queryset = DeliveryNote.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['number', 'client__name', 'delivered_by']
    ordering_fields = ['date', 'number', 'created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DeliveryNoteCreateSerializer
        return DeliveryNoteSerializer
    
    def get_queryset(self):
        queryset = DeliveryNote.objects.select_related('client', 'created_by').prefetch_related('items')
        
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        delivery_note = self.get_object()
        pdf_content = generate_delivery_note_pdf(delivery_note)
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{delivery_note.number}.pdf"'
        return response
