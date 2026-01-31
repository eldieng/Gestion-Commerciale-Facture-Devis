from django.contrib import admin
from .models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['number', 'client', 'date', 'status', 'total_ttc', 'created_by']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['number', 'client__name']
    inlines = [InvoiceItemInline]
    readonly_fields = ['number', 'total_ht', 'total_tva', 'total_ttc']
