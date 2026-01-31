from rest_framework import serializers
from .models import Invoice, InvoiceItem
from apps.clients.serializers import ClientSerializer
from apps.products.serializers import ProductSerializer


class InvoiceItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'product', 'product_detail', 'description', 'quantity', 
            'unit_price', 'tva_rate', 'total_ht', 'total_tva', 'total_ttc'
        ]
        read_only_fields = ['id', 'total_ht', 'total_tva', 'total_ttc']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    client_detail = ClientSerializer(source='client', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'number', 'client', 'client_detail', 'created_by', 'created_by_name',
            'status', 'status_display', 'date', 'due_date', 'notes',
            'total_ht', 'total_tva', 'total_ttc', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'number', 'created_by', 'total_ht', 'total_tva', 'total_ttc', 'created_at', 'updated_at']


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'client', 'date', 'due_date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        invoice = Invoice.objects.create(**validated_data)
        
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        invoice.calculate_totals()
        return invoice
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
            instance.calculate_totals()
        
        return instance
