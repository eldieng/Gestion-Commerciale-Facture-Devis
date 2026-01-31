from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'unit_price', 'tva_rate', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['tva_rate', 'created_at']
