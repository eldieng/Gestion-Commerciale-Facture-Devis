from django.contrib import admin
from .models import DeliveryNote, DeliveryNoteItem


class DeliveryNoteItemInline(admin.TabularInline):
    model = DeliveryNoteItem
    extra = 1


@admin.register(DeliveryNote)
class DeliveryNoteAdmin(admin.ModelAdmin):
    list_display = ['number', 'client', 'date', 'payment_method', 'delivered_by', 'created_by']
    list_filter = ['payment_method', 'date', 'created_at']
    search_fields = ['number', 'client__name', 'delivered_by']
    inlines = [DeliveryNoteItemInline]
    readonly_fields = ['number']
