from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone # NOVO IMPORT

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=0)
    min_quantity = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class StockMovement(models.Model):
    ENTRY = 'IN'
    EXIT = 'OUT'
    TYPE_CHOICES = [(ENTRY, 'Entrada'), (EXIT, 'Saída')]

    product = models.ForeignKey(Product, related_name='movements', on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=3, choices=TYPE_CHOICES)
    amount = models.IntegerField()
    performed_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now) # ALTERADO para permitir data manual

    class Meta:
        ordering = ['-created_at']