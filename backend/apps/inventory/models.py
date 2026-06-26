from django.db import models
from django.conf import settings


class ProcurementItem(models.Model):
    CATEGORY_CHOICES = [
        ('furniture',   'Furniture'),
        ('electronics', 'Electronics'),
        ('supplies',    'Supplies'),
        ('maintenance', 'Maintenance'),
    ]

    name          = models.CharField(max_length=100)
    category      = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    cost          = models.DecimalField(max_digits=10, decimal_places=2,
                        help_text="Purchase cost in NPR")
    utility_value = models.IntegerField(
                        help_text="Importance score 1–100")
    description   = models.TextField(blank=True)
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-utility_value']

    def __str__(self):
        return f"{self.name} | Cost: {self.cost} | Utility: {self.utility_value}"


class ProcurementSession(models.Model):
    STATUS_CHOICES = [
        ('optimized', 'Optimized'),
        ('purchased', 'Purchased'),
    ]

    created_by       = models.ForeignKey(
                           settings.AUTH_USER_MODEL,
                           on_delete=models.SET_NULL,
                           null=True,
                           related_name='procurement_sessions'
                       )
    total_budget     = models.DecimalField(max_digits=12, decimal_places=2)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES,
                           default='optimized')
    created_at       = models.DateTimeField(auto_now_add=True)
    optimized_at     = models.DateTimeField(null=True, blank=True)
    selected_items   = models.ManyToManyField(ProcurementItem, blank=True,
                           related_name='procurement_sessions')
    total_cost       = models.DecimalField(max_digits=12, decimal_places=2,
                           null=True, blank=True)
    total_utility    = models.IntegerField(null=True, blank=True)
    budget_remaining = models.DecimalField(max_digits=12, decimal_places=2,
                           null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Session #{self.id} | Budget: {self.total_budget} | {self.status}"