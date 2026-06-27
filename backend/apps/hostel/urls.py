# urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    HostelViewSet, BlockViewSet, FloorViewSet, RoomViewSet,
    LocationNodeViewSet, NodeEdgeViewSet,
    nodes_list_public, find_path_view, nearest_reception_view,
    nodes_by_purpose_view, available_rooms_view
)

router = DefaultRouter()
router.include_format_suffixes = False
router.register('hostels', HostelViewSet, basename='hostels')
router.register('blocks', BlockViewSet, basename='blocks')
router.register('floors', FloorViewSet, basename='floors')
router.register('rooms', RoomViewSet, basename='rooms')
router.register('nodes', LocationNodeViewSet, basename='nodes')
router.register('edges', NodeEdgeViewSet, basename='edges')

urlpatterns = router.urls + [
    path('nodes-public/', nodes_list_public, name='nodes_list_public'),
    path('navigate/', find_path_view, name='find_path'),
    path('nearest-reception/', nearest_reception_view, name='nearest_reception'),
    path('nodes-by-purpose/', nodes_by_purpose_view, name='nodes_by_purpose'),
    path('available-rooms/', available_rooms_view, name='available_rooms'),
]