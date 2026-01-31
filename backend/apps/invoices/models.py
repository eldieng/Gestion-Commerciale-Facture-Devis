from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.clients.models import Client
from apps.products.models import Product


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('finalized', 'Finalisée'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
    ]
    
    number = models.CharField(max_length=20, unique=True, verbose_name="Numéro de facture")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='invoices', verbose_name="Client")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='invoices',
        verbose_name="Créée par"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Statut")
    date = models.DateField(verbose_name="Date de facture")
    due_date = models.DateField(null=True, blank=True, verbose_name="Date d'échéance")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    total_ht = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'), verbose_name="Total HT")
    total_tva = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'), verbose_name="Total TVA")
    total_ttc = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'), verbose_name="Total TTC")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.number} - {self.client.name}"
    
    def save(self, *args, **kwargs):
        if not self.number:
            self.number = self.generate_number()
        super().save(*args, **kwargs)
    
    @classmethod
    def generate_number(cls):
        from django.utils import timezone
        year = timezone.now().year
        prefix = f"FAC-{year}-"
        last_invoice = cls.objects.filter(number__startswith=prefix).order_by('-number').first()
        if last_invoice:
            last_num = int(last_invoice.number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"{prefix}{new_num:03d}"
    
    def calculate_totals(self):
        total_ht = Decimal('0')
        total_tva = Decimal('0')
        for item in self.items.all():
            total_ht += item.total_ht
            total_tva += item.total_tva
        self.total_ht = total_ht
        self.total_tva = total_tva
        self.total_ttc = total_ht + total_tva
        self.save(update_fields=['total_ht', 'total_tva', 'total_ttc'])


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    description = models.CharField(max_length=500, verbose_name="Description")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Prix unitaire")
    tva_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('18'), verbose_name="Taux TVA (%)")
    
    total_ht = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'), verbose_name="Total HT")
    total_tva = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'), verbose_name="TVA")
    total_ttc = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'), verbose_name="Total TTC")
    
    class Meta:
        verbose_name = "Ligne de facture"
        verbose_name_plural = "Lignes de facture"
    
    def save(self, *args, **kwargs):
        self.total_ht = self.quantity * self.unit_price
        self.total_tva = self.total_ht * (self.tva_rate / Decimal('100'))
        self.total_ttc = self.total_ht + self.total_tva
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.description} x {self.quantity}"
