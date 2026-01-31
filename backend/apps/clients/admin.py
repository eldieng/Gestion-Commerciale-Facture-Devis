from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'ninea', 'created_at']
    search_fields = ['name', 'phone', 'email', 'ninea']
    list_filter = ['created_at']
