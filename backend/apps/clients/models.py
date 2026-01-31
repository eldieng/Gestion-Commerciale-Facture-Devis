from django.db import models


class Client(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise / Client")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    address = models.TextField(blank=True, verbose_name="Adresse")
    ninea = models.CharField(max_length=50, blank=True, verbose_name="NINEA")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ['name']
    
    def __str__(self):
        return self.name
