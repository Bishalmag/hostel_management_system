from django.contrib import admin
from .models import ProcurementItem, ProcurementSession


@admin.register(ProcurementItem)
class ProcurementItemAdmin(admin.ModelAdmin):
    list_display  = ['name', 'category', 'cost', 'utility_value', 'is_active']
    list_filter   = ['category', 'is_active']
    search_fields = ['name']
    list_editable = ['utility_value', 'is_active']


@admin.register(ProcurementSession)
class ProcurementSessionAdmin(admin.ModelAdmin):
    list_display    = ['id', 'created_by', 'total_budget', 'total_cost',
                       'total_utility', 'status', 'created_at']
    list_filter     = ['status']
    readonly_fields = ['selected_items', 'total_cost', 'total_utility',
                       'budget_remaining', 'optimized_at']