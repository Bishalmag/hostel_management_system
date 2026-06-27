from django.urls import path
from .views import occupancy_forecast

urlpatterns = [
    path('forecast/occupancy/', occupancy_forecast, name='occupancy-forecast'),
]
