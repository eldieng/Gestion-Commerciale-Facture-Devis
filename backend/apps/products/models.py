from django.db import models
from decimal import Decimal


class Product(models.Model):
    TVA_CHOICES = [
        (Decimal('0'), '0%'),
        (Decimal('18'), '18%'),
    ]
    
    name = models.CharField(max_length=255, verbose_name="Nom du produit")
    description = models.TextField(blank=True, verbose_name="Description")
    unit_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        verbose_name="Prix unitaire (FCFA)"
    )
    tva_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        choices=TVA_CHOICES, 
        default=Decimal('18'),
        verbose_name="Taux TVA (%)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.unit_price} FCFA"
