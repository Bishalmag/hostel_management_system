from rest_framework import serializers
from .models import ForecastCache

class ForecastCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastCache
        fields = ['id', 'created_at', 'horizon', 'history_json', 'forecast_json', 'moving_avg']
