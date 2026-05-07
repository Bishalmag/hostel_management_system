from django.urls import path
from .views import RoomAllocationView

urlpatterns = [
    path('allocations/', RoomAllocationView.as_view(), name='room-allocation'),
]

# This means:
# GET  /api/allocations/  → list all allocations
# POST /api/allocations/  → create new allocation
