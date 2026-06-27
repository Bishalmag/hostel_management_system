from django.contrib import admin
from .models import ForecastCache

@admin.register(ForecastCache)
class ForecastCacheAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'horizon', 'moving_avg']
