from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from apps.users.models import User


class Item(models.Model):
    ITEM_CATEGORY_CHOICES = [
        ('furniture', 'Furniture'),
        ('electronics', 'Electronics'),
        ('appliance', 'Appliance'),
        ('maintenance', 'Maintenance'),
    ]

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=ITEM_CATEGORY_CHOICES)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    utility_value = models.IntegerField(
        help_text="Value between 1 and 100",
        validators=[
            MinValueValidator(1),
            MaxValueValidator(100)
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Item'
        verbose_name_plural = 'Items'


class ProcurementPlan(models.Model):
    total_budget = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_budget = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan {self.id} - Total: {self.total_budget}, Remaining: {self.remaining_budget}"

    class Meta:
        verbose_name = 'Procurement Plan'
        verbose_name_plural = 'Procurement Plans'


class SelectedItem(models.Model):
    procurement_plan = models.ForeignKey(ProcurementPlan, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity} x {self.item.name} for Plan {self.procurement_plan.id}"

    class Meta:
        verbose_name = 'Selected Item'
        verbose_name_plural = 'Selected Items'
        unique_together = ('procurement_plan', 'item')