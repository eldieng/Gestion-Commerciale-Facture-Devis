from rest_framework import serializers
from .models import DeliveryNote, DeliveryNoteItem
from apps.clients.serializers import ClientSerializer
from apps.products.serializers import ProductSerializer


class DeliveryNoteItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = DeliveryNoteItem
        fields = ['id', 'product', 'product_detail', 'description', 'quantity', 'observation']
        read_only_fields = ['id']


class DeliveryNoteSerializer(serializers.ModelSerializer):
    items = DeliveryNoteItemSerializer(many=True, read_only=True)
    client_detail = ClientSerializer(source='client', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = DeliveryNote
        fields = [
            'id', 'number', 'client', 'client_detail', 'created_by', 'created_by_name',
            'date', 'payment_method', 'payment_method_display', 'delivered_by', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'number', 'created_by', 'created_at', 'updated_at']


class DeliveryNoteCreateSerializer(serializers.ModelSerializer):
    items = DeliveryNoteItemSerializer(many=True)
    
    class Meta:
        model = DeliveryNote
        fields = ['id', 'client', 'date', 'payment_method', 'delivered_by', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        delivery_note = DeliveryNote.objects.create(**validated_data)
        
        for item_data in items_data:
            DeliveryNoteItem.objects.create(delivery_note=delivery_note, **item_data)
        
        return delivery_note
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                DeliveryNoteItem.objects.create(delivery_note=instance, **item_data)
        
        return instance
