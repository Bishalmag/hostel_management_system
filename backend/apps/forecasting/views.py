from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import forecast_occupancy

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def occupancy_forecast(request):
    horizon = int(request.query_params.get('horizon', 14))
    data = forecast_occupancy(horizon=horizon)
    return Response(data)
