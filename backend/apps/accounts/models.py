from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('agent', 'Agent Commercial'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='agent')
    phone = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
