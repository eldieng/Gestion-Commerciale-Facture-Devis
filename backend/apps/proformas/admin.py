from django.contrib import admin
from .models import Proforma, ProformaItem


class ProformaItemInline(admin.TabularInline):
    model = ProformaItem
    extra = 1


@admin.register(Proforma)
class ProformaAdmin(admin.ModelAdmin):
    list_display = ['number', 'client', 'date', 'status', 'total_ttc', 'created_by']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['number', 'client__name']
    inlines = [ProformaItemInline]
    readonly_fields = ['number', 'total_ht', 'total_tva', 'total_ttc']
