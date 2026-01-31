from django.db import models
from django.conf import settings
from apps.clients.models import Client
from apps.products.models import Product


class DeliveryNote(models.Model):
    PAYMENT_CHOICES = [
        ('cash', 'Espèces'),
        ('check', 'Chèque'),
        ('transfer', 'Virement'),
        ('mobile', 'Mobile Money'),
        ('credit', 'Crédit'),
    ]
    
    number = models.CharField(max_length=20, unique=True, verbose_name="Numéro de bordereau")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='delivery_notes', verbose_name="Client")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='delivery_notes',
        verbose_name="Créé par"
    )
    date = models.DateField(verbose_name="Date de livraison")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, blank=True, verbose_name="Mode de paiement")
    delivered_by = models.CharField(max_length=100, blank=True, verbose_name="Livré par")
    notes = models.TextField(blank=True, verbose_name="Observations")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Bordereau de livraison"
        verbose_name_plural = "Bordereaux de livraison"
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
        prefix = f"BL-{year}-"
        last_note = cls.objects.filter(number__startswith=prefix).order_by('-number').first()
        if last_note:
            last_num = int(last_note.number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        return f"{prefix}{new_num:03d}"


class DeliveryNoteItem(models.Model):
    delivery_note = models.ForeignKey(DeliveryNote, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    description = models.CharField(max_length=500, verbose_name="Description")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantité")
    observation = models.CharField(max_length=500, blank=True, verbose_name="Observation")
    
    class Meta:
        verbose_name = "Ligne de bordereau"
        verbose_name_plural = "Lignes de bordereau"
    
    def __str__(self):
        return f"{self.description} x {self.quantity}"
