from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import RoomAllocation
from .serializers import RoomAllocationSerializer

class RoomAllocationView(APIView):

    # GET /api/allocations/ → fetch all
    def get(self, request):
        allocations = RoomAllocation.objects.all()
        serializer = RoomAllocationSerializer(allocations, many=True)
        return Response(serializer.data)

    # POST /api/allocations/ → create new
    def post(self, request):
        serializer = RoomAllocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # class RoomAllocationView(APIView):
    # permission_classes = [IsHostelAdmin]  # only admin can access